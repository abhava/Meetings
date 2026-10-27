/* Our Meetings: persistent action items and carry-forward links. */
(function () {
  const baseFactory = window.meetingsApp;
  if (typeof baseFactory !== "function") return;

  window.meetingsApp = function () {
    const state = baseFactory();
    state.actions = [];
    state.activeMembers = [];
    state.carryActionId = "";
    state.carryAgendaId = "";
    state.tasksLoading = false;
    state.tasksLoaded = false;
    state.tasksError = "";
    state.taskSaveBusy = false;
    state.taskStatusBusy = false;
    state.carrySaveBusy = false;

    Object.defineProperty(state, "canManageActions", {
      enumerable: true,
      get() { return ["owner", "admin"].includes(this.currentMembership?.role); }
    });
    Object.defineProperty(state, "canContributeActions", {
      enumerable: true,
      get() { return ["owner", "admin", "member"].includes(this.currentMembership?.role); }
    });
    Object.defineProperty(state, "carryForwardActions", {
      enumerable: true,
      get() {
        const meeting = this.selectedMeeting;
        if (!meeting) return [];
        return this.actions.filter(item =>
          !["Completed", "Cancelled"].includes(item.status) &&
          item.meetingId !== meeting.id &&
          !item.links.some(link => link.meetingId === meeting.id)
        );
      }
    });
    Object.defineProperty(state, "selectedMeetingLinks", {
      enumerable: true,
      get() {
        const meetingId = this.selectedMeeting?.id;
        if (!meetingId) return [];
        return this.actions.flatMap(item => item.links
          .filter(link => link.meetingId === meetingId)
          .map(link => ({ ...link, linked_by: link.linkedBy, actionId: item.id, actionTitle: item.title, actionStatus: item.status, originTitle: item.meetingTitle })));
      }
    });
    Object.defineProperty(state, "openCount", {
      enumerable: true,
      get() { return this.actions.filter(item => !["Completed", "Cancelled"].includes(item.status)).length; }
    });
    Object.defineProperty(state, "overdueCount", {
      enumerable: true,
      get() { return this.actions.filter(item => !["Completed", "Cancelled"].includes(item.status) && item.due && item.due < this.demoToday).length; }
    });
    Object.defineProperty(state, "filteredActions", {
      enumerable: true,
      get() {
        const q = String(this.actionSearch || "").toLowerCase().trim();
        return this.actions.filter(item => {
          const statusOk = this.actionFilter === "All" ||
            (this.actionFilter === "Open items" ? !["Completed", "Cancelled"].includes(item.status) : item.status === this.actionFilter);
          return statusOk &&
            (this.ownerFilter === "All" || item.owner === this.ownerFilter) &&
            (!q || [item.title, item.description, item.owner, item.meetingTitle, item.agendaTitle, item.status, item.priority].join(" ").toLowerCase().includes(q));
        }).sort((a, b) => {
          const aClosed = ["Completed", "Cancelled"].includes(a.status);
          const bClosed = ["Completed", "Cancelled"].includes(b.status);
          if (aClosed !== bClosed) return aClosed ? 1 : -1;
          if (!a.due && b.due) return 1;
          if (a.due && !b.due) return -1;
          return (a.due || "9999-12-31").localeCompare(b.due || "9999-12-31");
        });
      }
    });

    state.toUiActionStatus = function (status) {
      return ({ open: "Open", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" })[String(status || "").toLowerCase()] || "Open";
    };
    state.toDbActionStatus = function (status) {
      return ({ "Open": "open", "In Progress": "in_progress", "Completed": "completed", "Cancelled": "cancelled" })[status] || "open";
    };
    state.actionPriorityToDb = function (priority) {
      const normalized = String(priority || "Normal").toLowerCase();
      return ["low", "normal", "high", "urgent"].includes(normalized) ? normalized : "normal";
    };
    state.actionPriorityToUi = function (priority) {
      return this.titleCase(priority || "normal");
    };
    state.canEditAction = function (item) {
      if (!item || !this.authUser || !this.currentMembership) return false;
      if (this.canManageActions) return true;
      return this.canContributeActions &&
        (item.createdById === this.authUser.id || item.assigneeMembershipId === this.currentMembership.id);
    };
    state.formatShort = function (date) {
      if (!date) return "No due date";
      return new Date(date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };
    state.dueClass = function (due) {
      if (!due) return "";
      if (due < this.demoToday) return "due-overdue";
      const now = new Date(this.demoToday + "T12:00:00");
      const dueDate = new Date(due + "T12:00:00");
      if ((dueDate - now) / 86400000 <= 3) return "due-soon";
      return "";
    };

    state.loadWorkItemsFromDatabase = async function () {
      const orgId = this.currentOrganization?.id;
      const client = window.supabaseClient;
      if (!orgId || !client || this.tasksLoading) return;
      this.tasksLoading = true;
      this.tasksError = "";
      try {
        const [itemsResult, linksResult, membershipsResult] = await Promise.all([
          client.from("action_items")
            .select("id, organization_id, source_meeting_id, source_agenda_item_id, title, description, assignee_membership_id, due_date, priority, status, resolution_note, created_by, updated_by, created_at, updated_at")
            .eq("organization_id", orgId)
            .order("due_date", { ascending: true, nullsFirst: false }),
          client.from("action_item_links")
            .select("id, organization_id, action_item_id, meeting_id, agenda_item_id, linked_by, link_note, linked_at")
            .eq("organization_id", orgId)
            .order("linked_at", { ascending: true }),
          client.from("organization_memberships")
            .select("id, user_id, invited_email, committee_title, role, status")
            .eq("organization_id", orgId)
            .eq("status", "active")
            .order("created_at", { ascending: true })
        ]);
        if (itemsResult.error) throw new Error("Could not load action items: " + itemsResult.error.message);
        if (linksResult.error) throw new Error("Could not load carry-forward links: " + linksResult.error.message);
        if (membershipsResult.error) throw new Error("Could not load committee members for assignment: " + membershipsResult.error.message);

        const memberships = (membershipsResult.data || []).filter(row => row.role !== "viewer");
        const userIds = [...new Set(memberships.map(row => row.user_id).filter(Boolean))];
        let profileRows = [];
        if (userIds.length) {
          const profileResult = await client.from("profiles").select("id, full_name, email").in("id", userIds);
          if (profileResult.error) throw new Error("Could not load committee member names: " + profileResult.error.message);
          profileRows = profileResult.data || [];
        }
        const profilesByUserId = Object.fromEntries(profileRows.map(row => [row.id, row]));
        const membersById = {};
        this.activeMembers = memberships.map(row => {
          const profile = profilesByUserId[row.user_id] || {};
          const name = String(profile.full_name || "").trim() || String(row.committee_title || "").trim() || String(profile.email || row.invited_email || "").trim() || "Committee member";
          const member = { id: row.id, userId: row.user_id, name, email: profile.email || row.invited_email || "", role: row.role, committeeTitle: row.committee_title || "" };
          membersById[row.id] = member;
          return member;
        });

        const linksByActionId = {};
        (linksResult.data || []).forEach(row => {
          if (!linksByActionId[row.action_item_id]) linksByActionId[row.action_item_id] = [];
          const linkedMeeting = this.meetings.find(meeting => meeting.id === row.meeting_id);
          const linkedAgenda = linkedMeeting?.agenda.find(item => item.id === row.agenda_item_id);
          linksByActionId[row.action_item_id].push({
            id: row.id,
            meetingId: row.meeting_id,
            meetingTitle: linkedMeeting?.title || "Meeting unavailable",
            agendaId: row.agenda_item_id || "",
            agendaTitle: linkedAgenda?.title || "General follow-up",
            linkedBy: row.linked_by,
            linkNote: row.link_note || "",
            linkedAt: row.linked_at
          });
        });

        this.actions = (itemsResult.data || []).map(row => {
          const sourceMeeting = this.meetings.find(meeting => meeting.id === row.source_meeting_id);
          const sourceAgenda = sourceMeeting?.agenda.find(item => item.id === row.source_agenda_item_id);
          const member = membersById[row.assignee_membership_id];
          return {
            id: row.id,
            title: row.title,
            description: row.description || "",
            owner: member?.name || (row.assignee_membership_id ? "Committee member" : "Unassigned"),
            assigneeMembershipId: row.assignee_membership_id || "",
            due: row.due_date || "",
            status: this.toUiActionStatus(row.status),
            priority: this.actionPriorityToUi(row.priority),
            meetingId: row.source_meeting_id,
            meetingTitle: sourceMeeting?.title || "Meeting unavailable",
            agendaId: row.source_agenda_item_id || "",
            agendaTitle: sourceAgenda?.title || "General follow-up",
            createdById: row.created_by || "",
            updatedById: row.updated_by || "",
            resolutionNote: row.resolution_note || "",
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            links: linksByActionId[row.id] || []
          };
        });
        this.tasksLoaded = true;
        const eligible = this.carryForwardActions;
        if (!eligible.some(item => item.id === this.carryActionId)) this.carryActionId = eligible[0]?.id || "";
        if (!this.selectedMeeting?.agenda.some(item => item.id === this.carryAgendaId)) this.carryAgendaId = "";
      } catch (error) {
        this.actions = [];
        this.activeMembers = [];
        this.tasksLoaded = false;
        this.tasksError = error?.message || "Could not load action items.";
      } finally {
        this.tasksLoading = false;
      }
    };

    state.openActionCreate = function () {
      if (!this.canContributeActions) {
        this.toast("Your role is read-only for action items.");
        return;
      }
      const next = this.meetings.filter(meeting => meeting.status === "Scheduled").sort((a, b) => a.date.localeCompare(b.date))[0] || this.meetings[0];
      if (!next) {
        this.toast("Schedule a meeting before adding an action item.");
        return;
      }
      this.editingActionId = null;
      this.actionForm = {
        title: "", description: "", assigneeMembershipId: this.currentMembership?.id || "",
        due: this.defaultMeetingDate(), meetingId: next.id, agendaId: "",
        status: "Open", priority: "Normal"
      };
      this.showActionModal = true;
    };

    state.editAction = function (id) {
      const item = this.actions.find(action => action.id === id);
      if (!item) return;
      if (!this.canEditAction(item)) {
        this.toast("Only an administrator, the creator, or the assigned member can edit this action item.");
        return;
      }
      this.editingActionId = id;
      this.actionForm = {
        title: item.title,
        description: item.description || "",
        assigneeMembershipId: item.assigneeMembershipId || "",
        due: item.due || "",
        meetingId: item.meetingId,
        agendaId: item.agendaId || "",
        status: item.status,
        priority: item.priority || "Normal"
      };
      this.showActionModal = true;
    };

    state.saveAction = async function () {
      if (this.taskSaveBusy) return;
      const form = this.actionForm;
      const title = String(form.title || "").trim();
      if (!this.canContributeActions) {
        this.toast("Your role is read-only for action items.");
        return;
      }
      if (!title) {
        this.toast("Enter an action item description.");
        return;
      }
      const existing = this.editingActionId ? this.actions.find(item => item.id === this.editingActionId) : null;
      if (this.editingActionId && !existing) {
        this.toast("This action item is no longer available. Refresh the list and try again.");
        return;
      }
      if (existing && !this.canEditAction(existing)) {
        this.toast("You do not have permission to edit this action item.");
        return;
      }
      const sourceMeeting = existing ? this.meetings.find(meeting => meeting.id === existing.meetingId) : this.meetings.find(meeting => meeting.id === form.meetingId);
      if (!sourceMeeting) {
        this.toast("Select a valid originating meeting.");
        return;
      }
      const sourceAgendaId = existing ? existing.agendaId : (form.agendaId || "");
      if (sourceAgendaId && !sourceMeeting.agenda.some(item => item.id === sourceAgendaId)) {
        this.toast("Select an agenda item belonging to the originating meeting.");
        return;
      }
      if (form.assigneeMembershipId && !this.activeMembers.some(member => member.id === form.assigneeMembershipId)) {
        this.toast("Select an active committee member as the assignee.");
        return;
      }
      const payload = {
        title,
        description: String(form.description || "").trim(),
        assignee_membership_id: form.assigneeMembershipId || null,
        due_date: form.due || null,
        priority: this.actionPriorityToDb(form.priority),
        status: this.toDbActionStatus(form.status),
        updated_by: this.authUser.id
      };
      this.taskSaveBusy = true;
      try {
        if (existing) {
          const { data, error } = await window.supabaseClient.from("action_items")
            .update(payload).eq("id", existing.id).eq("organization_id", this.currentOrganization.id)
            .select("id").maybeSingle();
          if (error) throw error;
          if (!data) throw new Error("The action item was not updated. Check your role or assignment.");
        } else {
          const { error } = await window.supabaseClient.from("action_items").insert({
            ...payload,
            organization_id: this.currentOrganization.id,
            source_meeting_id: sourceMeeting.id,
            source_agenda_item_id: sourceAgendaId || null,
            created_by: this.authUser.id
          });
          if (error) throw error;
        }
        this.showActionModal = false;
        this.editingActionId = null;
        await this.loadWorkItemsFromDatabase();
        this.toast(existing ? "Action item updated." : "Action item saved.");
      } catch (error) {
        this.toast("Could not save action item: " + (error?.message || "Database error"));
      } finally {
        this.taskSaveBusy = false;
      }
    };

    state.updateActionStatus = async function (id, status) {
      const item = this.actions.find(action => action.id === id);
      if (!item) return;
      if (!this.canEditAction(item)) {
        await this.loadWorkItemsFromDatabase();
        this.toast("You do not have permission to change this action item's status.");
        return;
      }
      if (this.taskStatusBusy) return;
      this.taskStatusBusy = true;
      try {
        const { data, error } = await window.supabaseClient.from("action_items")
          .update({ status: this.toDbActionStatus(status), updated_by: this.authUser.id })
          .eq("id", id).eq("organization_id", this.currentOrganization.id)
          .select("id").maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("The status was not changed. Check your role or assignment.");
        await this.loadWorkItemsFromDatabase();
        this.toast("Action item status saved.");
      } catch (error) {
        await this.loadWorkItemsFromDatabase();
        this.toast("Could not update status: " + (error?.message || "Database error"));
      } finally {
        this.taskStatusBusy = false;
      }
    };

    state.toggleAction = async function (id) {
      const item = this.actions.find(action => action.id === id);
      if (!item) return;
      const nextStatus = item.status === "Completed" ? "Open" : "Completed";
      await this.updateActionStatus(id, nextStatus);
    };
    state.completeAction = async function (id) {
      const item = this.actions.find(action => action.id === id);
      if (item && item.status !== "Completed") await this.updateActionStatus(id, "Completed");
    };

    state.refreshCarrySelection = function () {
      const eligible = this.carryForwardActions;
      if (!eligible.some(item => item.id === this.carryActionId)) this.carryActionId = eligible[0]?.id || "";
      if (!this.selectedMeeting?.agenda.some(item => item.id === this.carryAgendaId)) this.carryAgendaId = "";
    };

    state.carryActionToMeeting = async function () {
      const meeting = this.selectedMeeting;
      const action = this.actions.find(item => item.id === this.carryActionId);
      if (!this.canContributeActions) {
        this.toast("Your role cannot create carry-forward links.");
        return;
      }
      if (!meeting || meeting.status !== "Scheduled") {
        this.toast("Select a scheduled meeting to carry the action forward.");
        return;
      }
      if (!action || !this.carryForwardActions.some(item => item.id === action.id)) {
        this.toast("Choose an unresolved action from an earlier meeting.");
        return;
      }
      if (this.carrySaveBusy) return;
      const agendaId = this.carryAgendaId || null;
      if (agendaId && !meeting.agenda.some(item => item.id === agendaId)) {
        this.toast("Choose an agenda item from the selected meeting.");
        return;
      }
      this.carrySaveBusy = true;
      try {
        const { error } = await window.supabaseClient.from("action_item_links").insert({
          organization_id: this.currentOrganization.id,
          action_item_id: action.id,
          meeting_id: meeting.id,
          agenda_item_id: agendaId,
          linked_by: this.authUser.id,
          link_note: ""
        });
        if (error) throw error;
        await this.loadWorkItemsFromDatabase();
        this.refreshCarrySelection();
        this.toast("Carry-forward link saved. The original meeting reference is unchanged.");
      } catch (error) {
        const message = error?.message || "Database error";
        this.toast(message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")
          ? "This action is already linked to that meeting/agenda."
          : "Could not carry action forward: " + message);
      } finally {
        this.carrySaveBusy = false;
      }
    };

    state.unlinkAction = async function (actionId, linkId) {
      const action = this.actions.find(item => item.id === actionId);
      const link = action?.links.find(item => item.id === linkId);
      if (!action || !link || link.meetingId !== this.selectedMeeting?.id) return;
      if (!this.canManageActions && link.linkedBy !== this.authUser?.id) {
        this.toast("Only the person who created this link or an administrator can remove it.");
        return;
      }
      if (!confirm("Remove this carry-forward link? The original action item and its history will be kept.")) return;
      try {
        const { data, error } = await window.supabaseClient.from("action_item_links").delete()
          .eq("id", linkId).eq("organization_id", this.currentOrganization.id)
          .select("id").maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("The link was not removed. Check your permissions.");
        await this.loadWorkItemsFromDatabase();
        this.toast("Carry-forward link removed; original action retained.");
      } catch (error) {
        this.toast("Could not remove carry-forward link: " + (error?.message || "Database error"));
      }
    };

    const baseSwitchMembership = state.switchMembership;
    state.switchMembership = function (membershipId) {
      const next = this.memberships.find(item => item.id === membershipId);
      const nextOrgId = next?.organization?.id;
      if (this.currentOrganization?.id !== nextOrgId) {
        this.actions = [];
        this.activeMembers = [];
        this.tasksLoaded = false;
        this.tasksError = "";
        this.carryActionId = "";
      }
      return baseSwitchMembership.call(this, membershipId);
    };

    const baseLoadMeetings = state.loadMeetingsFromDatabase;
    state.loadMeetingsFromDatabase = async function (...args) {
      await baseLoadMeetings.apply(this, args);
      if (this.currentOrganization?.id && this.meetingsLoaded) await this.loadWorkItemsFromDatabase();
    };

    const baseOpenMeeting = state.openMeeting;
    state.openMeeting = function (id) {
      baseOpenMeeting.call(this, id);
      this.refreshCarrySelection();
    };

    return state;
  };
})();