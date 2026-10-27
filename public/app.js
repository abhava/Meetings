(function () {
  const mkAgenda = (id, title, category, notes = "", decision = "", expanded = false) => ({ id, title, category, notes, decision, expanded });
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
  window.meetingsApp = function () {
    return {
      authState: "checking",
      authUser: null, authSession: null, profile: null,
      memberships: [], currentMembership: null, currentOrganization: null,
      selectedMembershipId: "", loginEmail: "", loginBusy: false,
      authError: "", authMessage: "", organizationName: "", organizationSlug: "",
      organizationBusy: false, authSubscription: null,
      invitationToken: new URLSearchParams(window.location.search).get("invite") || "",
      invitationDetails: null, invitationLookupBusy: false, inviteAcceptBusy: false,
      inviteEmail: "", inviteRole: "member", inviteBusy: false, inviteRevokeBusy: false,
      invitationError: "", invitationMessage: "", invitationLink: "",
      invitationRows: [], organizationMembers: [], membersLoading: false, rosterError: "",
      meetingsLoading: false, meetingsLoaded: false, meetingsError: "", meetingSaveBusy: false,
      agendaSaveBusy: false, agendaNoteSaveBusy: false, minutesSaveBusy: false,
      tasksLoading: false, tasksLoaded: false, tasksError: "",
      taskSaveBusy: false, taskStatusBusy: false, carrySaveBusy: false,
      activeMembers: [], workItemMembers: {}, workItemLinks: [],
      page: "dashboard", pageTitle: "Dashboard", mobileNav: false,
      demoToday: today, selectedMeeting: null,
      meetingSearch: "", meetingFilter: "All", meetingYear: "All",
      actionSearch: "", actionFilter: "Open items", ownerFilter: "All",
      minutesSearch: "", minutesYear: "All", reminderFilter: "All",
      showMeetingModal: false, showAgendaModal: false, showActionModal: false, showCancelModal: false,
      editingMeetingId: null, editingAgendaId: null, editingActionId: null, cancelTargetId: null, cancelReason: "", carryActionId: "", carryAgendaId: "",
      toastMessage: "", toastTimer: null,
      settings: { dayBefore: true, hourBefore: true, after: false },
      meetingForm: { title: "", date: "2026-10-30", time: "18:30", venue: "Society clubhouse", status: "Scheduled", attendees: "Alex Shah, Maya Patel, Ravi Desai", description: "" },
      agendaForm: { title: "", category: "Discussion" },
      actionForm: { title: "", description: "", assigneeMembershipId: "", due: "", meetingId: "", agendaId: "", priority: "Normal", status: "Open" },
      sampleMeetings: [
        { id: "mtg-001", title: "Monthly Committee Meeting", date: "2026-10-23", time: "6:30 PM", venue: "Clubhouse · Meeting Room", status: "Scheduled", description: "Review the committee's current priorities, confirm vendor follow-ups, and agree on the next set of community improvements.", createdBy: "Alex Shah", updated: "Oct 17, 2026", attendees: ["Alex Shah", "Maya Patel", "Ravi Desai", "Neha Kulkarni", "Karan Mehta"], agenda: [
          mkAgenda("ag-001", "Review previous meeting action items", "Follow-up", "Three items remain open from the last committee discussion. The water audit is in progress; the housekeeping quotations are pending.", "Carry forward all unfinished work with a named owner and due date.", true),
          mkAgenda("ag-002", "Water supply and leakage update", "Discussion", "Water committee to review tank-level observations, tanker usage, and the building-wise leakage survey.", "", false),
          mkAgenda("ag-003", "Housekeeping vendor review", "Decision", "", "", false),
          mkAgenda("ag-004", "Community improvements and next steps", "Discussion", "", "", false)
        ] },
        { id: "mtg-002", title: "Parking Policy Working Session", date: "2026-10-27", time: "7:00 PM", venue: "Online · Video call", status: "Scheduled", description: "Review resident feedback and refine the draft parking policy before it is circulated for committee review.", createdBy: "Maya Patel", updated: "Oct 16, 2026", attendees: ["Maya Patel", "Alex Shah", "Neha Kulkarni", "Sanjay Rao"], agenda: [
          mkAgenda("ag-005", "Review feedback received from residents", "Review", "Feedback has been grouped into allocation fairness, visitor parking, and enforcement.", "", true),
          mkAgenda("ag-006", "Clarify temporary parking arrangements", "Discussion", "", "", false),
          mkAgenda("ag-007", "Agree the next draft and review date", "Decision", "", "", false)
        ] },
        { id: "mtg-003", title: "Water & Infrastructure Review", date: "2026-11-04", time: "10:00 AM", venue: "Clubhouse · Meeting Room", status: "Scheduled", description: "Review water consumption, supply constraints, and priority infrastructure maintenance.", createdBy: "Ravi Desai", updated: "Oct 15, 2026", attendees: ["Ravi Desai", "Alex Shah", "Vaibhav Joshi", "Umesh Patil"], agenda: [
          mkAgenda("ag-008", "Review building-wise water consumption", "Review", "", "", true),
          mkAgenda("ag-009", "Leakage survey findings and next steps", "Discussion", "", "", false),
          mkAgenda("ag-010", "Pump and pipeline maintenance", "Decision", "", "", false)
        ] },
        { id: "mtg-004", title: "Finance & Vendor Review", date: "2026-11-12", time: "5:30 PM", venue: "Committee Office", status: "Scheduled", description: "Review operating expenses, quotations, and open vendor decisions.", createdBy: "Alex Shah", updated: "Oct 14, 2026", attendees: ["Alex Shah", "Karan Mehta", "Maya Patel"], agenda: [
          mkAgenda("ag-011", "Review monthly expense summary", "Review", "", "", true),
          mkAgenda("ag-012", "Compare housekeeping quotations", "Decision", "", "", false),
          mkAgenda("ag-013", "Confirm action owners and deadlines", "Follow-up", "", "", false)
        ] },
        { id: "mtg-005", title: "September Committee Review", date: "2026-09-22", time: "6:30 PM", venue: "Clubhouse · Meeting Room", status: "Completed", description: "Monthly review of society operations and committee decisions.", createdBy: "Alex Shah", updated: "Sep 23, 2026", attendees: ["Alex Shah", "Maya Patel", "Ravi Desai", "Neha Kulkarni"], agenda: [
          mkAgenda("ag-014", "Review water supply issues", "Discussion", "PCMC supply levels improved after reconnection work, but peak usage remains a concern.", "Water committee to continue the leakage survey, beginning with higher-consumption areas.", true),
          mkAgenda("ag-015", "Review housekeeping service", "Decision", "Residents shared feedback on cleaning schedules and quality.", "Obtain two additional vendor quotations for comparison.", false),
          mkAgenda("ag-016", "Parking policy feedback", "Review", "Committee reviewed the current feedback themes.", "Revise the draft and share an updated copy for member review.", false)
        ] },
        { id: "mtg-006", title: "Budget Planning Discussion", date: "2026-09-08", time: "7:00 PM", venue: "Committee Office", status: "Completed", description: "Review maintenance costs and agree initial budget planning steps.", createdBy: "Karan Mehta", updated: "Sep 09, 2026", attendees: ["Karan Mehta", "Alex Shah", "Maya Patel"], agenda: [
          mkAgenda("ag-017", "Review major expense heads", "Review", "Security, electricity, housekeeping, and water tankers make up the main recurring costs.", "Prepare a consolidated expense comparison for the next meeting.", true),
          mkAgenda("ag-018", "Plan next quarter priorities", "Discussion", "Several common-area improvement ideas were discussed.", "Bring cost estimates for the play area and pathway work.", false)
        ] },
        { id: "mtg-007", title: "Vendor Coordination Call", date: "2026-08-26", time: "11:30 AM", venue: "Online · Video call", status: "Cancelled", cancelReason: "Rescheduled because key committee members were unavailable.", description: "A short coordination call to align vendor deliverables.", createdBy: "Maya Patel", updated: "Aug 25, 2026", attendees: ["Maya Patel", "Ravi Desai", "Karan Mehta"], agenda: [
          mkAgenda("ag-019", "Confirm the vendor visit", "Discussion", "", "", false),
          mkAgenda("ag-020", "Align on outstanding deliverables", "Follow-up", "", "", false)
        ] },
        { id: "mtg-008", title: "Common Area Project Check-in", date: "2026-08-11", time: "6:00 PM", venue: "Clubhouse · Meeting Room", status: "Completed", description: "Initial check-in on common area improvement proposals.", createdBy: "Alex Shah", updated: "Aug 12, 2026", attendees: ["Alex Shah", "Neha Kulkarni", "Karan Mehta"], agenda: [
          mkAgenda("ag-021", "Review proposed common area work", "Discussion", "Play area, entry paths, and clubhouse improvements were discussed.", "Seek indicative estimates before prioritising the work.", true),
          mkAgenda("ag-022", "Assign initial research tasks", "Follow-up", "Committee members volunteered to coordinate with vendors.", "Bring estimates and options to the next review.", false)
        ] }
      ],
      meetings: [],
      sampleActions: [
        { id: "act-001", title: "Complete building-wise leakage survey", owner: "Vaibhav Joshi", due: "2026-10-20", status: "In Progress", meetingId: "mtg-005", meetingTitle: "September Committee Review", agendaId: "ag-014", agendaTitle: "Review water supply issues" },
        { id: "act-002", title: "Collect two housekeeping quotations", owner: "Neha Kulkarni", due: "2026-10-21", status: "Open", meetingId: "mtg-005", meetingTitle: "September Committee Review", agendaId: "ag-015", agendaTitle: "Review housekeeping service" },
        { id: "act-003", title: "Update parking policy draft", owner: "Maya Patel", due: "2026-10-25", status: "Open", meetingId: "mtg-005", meetingTitle: "September Committee Review", agendaId: "ag-016", agendaTitle: "Parking policy feedback" },
        { id: "act-004", title: "Prepare expense comparison sheet", owner: "Karan Mehta", due: "2026-10-29", status: "Open", meetingId: "mtg-006", meetingTitle: "Budget Planning Discussion", agendaId: "ag-017", agendaTitle: "Review major expense heads" },
        { id: "act-005", title: "Get indicative play area estimates", owner: "Ravi Desai", due: "2026-10-16", status: "Open", meetingId: "mtg-008", meetingTitle: "Common Area Project Check-in", agendaId: "ag-021", agendaTitle: "Review proposed common area work" },
        { id: "act-006", title: "Share clubhouse improvement options", owner: "Alex Shah", due: "2026-10-24", status: "Completed", meetingId: "mtg-008", meetingTitle: "Common Area Project Check-in", agendaId: "ag-022", agendaTitle: "Assign initial research tasks" },
        { id: "act-007", title: "Confirm meter replacement schedule", owner: "Umesh Patil", due: "2026-10-30", status: "In Progress", meetingId: "mtg-001", meetingTitle: "Monthly Committee Meeting", agendaId: "ag-002", agendaTitle: "Water supply and leakage update" }
      ],
      actions: [],
      reminders: [
        { id: "rem-001", meetingId: "mtg-001", title: "Monthly Committee Meeting", date: "2026-10-22", time: "6:30 PM", meetingTime: "6:30 PM", offset: "24 hours before", channel: "In-app demo", sent: false, cancelled: false },
        { id: "rem-002", meetingId: "mtg-001", title: "Monthly Committee Meeting", date: "2026-10-23", time: "5:30 PM", meetingTime: "6:30 PM", offset: "1 hour before", channel: "In-app demo", sent: false, cancelled: false },
        { id: "rem-003", meetingId: "mtg-002", title: "Parking Policy Working Session", date: "2026-10-26", time: "7:00 PM", meetingTime: "7:00 PM", offset: "24 hours before", channel: "In-app demo", sent: false, cancelled: false },
        { id: "rem-004", meetingId: "mtg-005", title: "September Committee Review", date: "2026-09-21", time: "6:30 PM", meetingTime: "6:30 PM", offset: "24 hours before", channel: "In-app demo", sent: true, cancelled: false },
        { id: "rem-005", meetingId: "mtg-003", title: "Water & Infrastructure Review", date: "2026-11-03", time: "10:00 AM", meetingTime: "10:00 AM", offset: "24 hours before", channel: "In-app demo", sent: false, cancelled: false },
        { id: "rem-006", meetingId: "mtg-004", title: "Finance & Vendor Review", date: "2026-11-12", time: "4:30 PM", meetingTime: "5:30 PM", offset: "1 hour before", channel: "In-app demo", sent: false, cancelled: false }
      ],
      async init() {
        this.sortMeetings();
        this.selectedMeeting = null;
        this.authState = "checking";
        const client = window.supabaseClient;
        if (!client) {
          this.authState = "error";
          this.authError = "Our Meetings couldn't start. Refresh the page or try again shortly.";
          return;
        }
        if (this.invitationToken) await this.loadInvitationDetails();
        const app = this;
        const listener = client.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_OUT") {
            setTimeout(() => {
              app.resetAuthContext();
              app.authState = "signedOut";
            }, 0);
          } else if (session) {
            app.authSession = session;
            setTimeout(() => app.loadUserContext(session), 0);
          } else if (event === "INITIAL_SESSION") {
            setTimeout(() => {
              if (app.authState === "checking") app.authState = "signedOut";
            }, 0);
          }
        });
        this.authSubscription = listener?.data?.subscription || null;
        const { data, error } = await client.auth.getSession();
        if (error) {
          this.authState = "error";
          this.authError = "Unable to check your session: " + error.message;
          return;
        }
        if (data?.session) {
          await this.loadUserContext(data.session);
        } else if (this.authState === "checking") {
          this.authState = "signedOut";
        }
      },
      async sendMagicLink() {
        const email = String(this.loginEmail || "").trim().toLowerCase();
        if (!email) {
          this.authError = "Enter your email address.";
          return;
        }
        this.loginBusy = true;
        this.authError = "";
        this.authMessage = "";
        try {
          let shouldCreateUser = false;
          if (this.invitationToken) {
            await this.loadInvitationDetails();
            if (!this.invitationDetails?.valid) throw new Error("This invitation is invalid or expired. Ask your committee owner for a new link.");
            if (email !== String(this.invitationDetails.email || "").trim().toLowerCase()) {
              throw new Error("Use the exact email address to which this invitation was issued.");
            }
            // Only an invitation bearer with a valid, unexpired token may trigger
            // first-time Auth account creation from this UI.
            shouldCreateUser = true;
          }
          const redirectUrl = new URL("/", window.location.origin);
          if (this.invitationToken) redirectUrl.searchParams.set("invite", this.invitationToken);
          const { error } = await window.supabaseClient.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectUrl.toString(),
              shouldCreateUser
            }
          });
          if (error) {
            this.authError = error.message;
          } else {
            this.authMessage = "If this email belongs to a registered account, a sign-in link has been sent. Open it in this browser to continue.";
          }
        } catch (err) {
          this.authError = err?.message || "Could not request a sign-in link.";
        } finally {
          this.loginBusy = false;
        }
      },
      async loadUserContext(session, force = false) {
        if (!session?.user) {
          this.resetAuthContext();
          this.authState = "signedOut";
          return;
        }
        const userId = session.user.id;
        if (!force && this.authUser?.id === userId && (this.authState === "loading" || this.authState === "ready" || this.authState === "noMembership")) return;
        this.authState = "loading";
        this.authError = "";
        this.authSession = session;
        this.authUser = session.user;
        const client = window.supabaseClient;
        try {
          const results = await Promise.all([
            client.from("profiles").select("id, full_name, email, phone, avatar_url").eq("id", userId).maybeSingle(),
            client.from("organization_memberships").select("id, organization_id, role, status, committee_title, created_at").eq("user_id", userId).eq("status", "active").order("created_at", { ascending: true })
          ]);
          const profileResult = results[0];
          const membershipResult = results[1];
          if (profileResult.error) throw new Error("Could not load your profile: " + profileResult.error.message);
          if (membershipResult.error) throw new Error("Could not load committee memberships: " + membershipResult.error.message);
          this.profile = profileResult.data || {
            id: userId,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
            email: session.user.email || ""
          };
          if (!this.profile.email) this.profile.email = session.user.email || "";
          const rows = membershipResult.data || [];
          if (!rows.length) {
            this.memberships = [];
            this.currentMembership = null;
            this.currentOrganization = null;
            this.selectedMembershipId = "";
            this.organizationName = "";
            this.organizationSlug = "";
            this.authState = "noMembership";
            if (this.invitationToken) await this.loadInvitationDetails();
            return;
          }
          const organizationIds = [...new Set(rows.map(row => row.organization_id))];
          const { data: organizations, error: organizationError } = await client.from("organizations").select("id, name, slug, timezone").in("id", organizationIds);
          if (organizationError) throw new Error("Could not load your committee workspace: " + organizationError.message);
          const orgById = Object.fromEntries((organizations || []).map(org => [org.id, org]));
          const resolved = rows.map(row => ({ ...row, organization: orgById[row.organization_id] })).filter(row => !!row.organization);
          if (!resolved.length) throw new Error("Your membership is active, but no accessible organization was returned. Check the organizations table policies.");
          this.memberships = resolved;
          const chosen = resolved.find(m => m.id === this.selectedMembershipId) || resolved[0];
          this.switchMembership(chosen.id);
          this.authState = "ready";
        } catch (err) {
          this.authError = err?.message || "Unable to load your committee access.";
          this.authState = "error";
        }
      },
      switchMembership(membershipId) {
        const membership = this.memberships.find(item => item.id === membershipId);
        if (!membership) return;
        const organizationChanged = this.currentOrganization?.id !== membership.organization?.id;
        this.selectedMembershipId = membership.id;
        this.currentMembership = membership;
        this.currentOrganization = membership.organization;
        if (organizationChanged) {
          this.invitationRows = [];
          this.organizationMembers = [];
          this.invitationLink = "";
          this.invitationMessage = "";
          this.meetings = [];
          this.actions = [];
          this.activeMembers = [];
          this.selectedMeeting = null;
          this.meetingsLoaded = false;
          this.meetingsError = "";
          this.tasksLoaded = false;
          this.tasksError = "";
          this.loadWorkspaceData();
        }
      },
      async loadWorkspaceData() {
        await this.loadMeetingsFromDatabase();
      },
      get canManageMeetings() {
        return ["owner", "admin"].includes(this.currentMembership?.role);
      },
      get canRecordMinutes() {
        return ["owner", "admin", "member"].includes(this.currentMembership?.role);
      },
      get canContributeActions() {
        return ["owner", "admin", "member"].includes(this.currentMembership?.role);
      },
      get canManageActions() {
        return ["owner", "admin"].includes(this.currentMembership?.role);
      },
      get canManageInvitations() {
        return this.currentMembership?.role === "owner";
      },
      get invitationMatchesSignedInUser() {
        return !!(this.invitationDetails?.valid && this.authUser?.email &&
          String(this.authUser.email).trim().toLowerCase() === String(this.invitationDetails.email || "").trim().toLowerCase());
      },
      get noMembershipMessage() {
        if (this.invitationLookupBusy) return "Checking the invitation and confirming that it belongs to your email address…";
        if (this.invitationDetails?.valid && this.invitationMatchesSignedInUser) {
          return "You're signed in as " + this.authUser.email + ". Accept the invitation below to activate your preassigned role in " + (this.invitationDetails.organization_name || "the committee workspace") + ".";
        }
        if (this.invitationDetails?.valid && !this.invitationMatchesSignedInUser) {
          return "This invitation is for " + this.invitationDetails.email + ". Sign out and request a magic link using that exact email address.";
        }
        return "You're signed in as " + (this.authUser?.email || "this account") + ", but have no active committee membership. Knowing the app URL or signing in does not grant access. Contact your committee owner for an invitation link.";
      },
      canEditAction(action) {
        if (!action || !this.canContributeActions) return false;
        return this.canManageActions ||
          action.createdById === this.authUser?.id ||
          action.assigneeMembershipId === this.currentMembership?.id;
      },
      toUiActionStatus(status) {
        return ({ open: "Open", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" })[String(status || "").toLowerCase()] || "Open";
      },
      toDbActionStatus(status) {
        return ({ "Open": "open", "In Progress": "in_progress", "Completed": "completed", "Cancelled": "cancelled" })[status] || "open";
      },
      toUiPriority(priority) {
        return ({ low: "Low", normal: "Normal", high: "High", urgent: "Urgent" })[String(priority || "").toLowerCase()] || "Normal";
      },
      toDbPriority(priority) {
        return ({ "Low": "low", "Normal": "normal", "High": "high", "Urgent": "urgent" })[priority] || "normal";
      },
      async loadMeetingsFromDatabase() {
        const orgId = this.currentOrganization?.id;
        const client = window.supabaseClient;
        if (!orgId || !client) return;
        this.meetingsLoading = true;
        this.meetingsError = "";
        try {
          const results = await Promise.all([
            client.from("meetings")
              .select("id, organization_id, title, description, meeting_type, starts_at, ends_at, timezone, venue, meeting_url, status, cancellation_reason, cancelled_at, completed_at, created_by, created_at, updated_at")
              .eq("organization_id", orgId)
              .order("starts_at", { ascending: true }),
            client.from("meeting_attendees")
              .select("id, meeting_id, membership_id, attendee_name, attendee_email")
              .eq("organization_id", orgId),
            client.from("agenda_items")
              .select("id, meeting_id, title, description, category, position")
              .eq("organization_id", orgId)
              .order("position", { ascending: true }),
            client.from("agenda_item_minutes")
              .select("agenda_item_id, discussion_notes, decision_summary, decision, recorded_by, recorded_at, updated_at")
              .eq("organization_id", orgId),
            client.from("meeting_minutes")
              .select("id, organization_id, meeting_id, summary, status, prepared_by, finalized_by, finalized_at, updated_at")
              .eq("organization_id", orgId)
          ]);
          const [meetingResult, attendeeResult, agendaResult, minutesResult, coverMinutesResult] = results;
          if (meetingResult.error) throw new Error("Could not load meetings: " + meetingResult.error.message);
          if (attendeeResult.error) throw new Error("Could not load meeting attendees: " + attendeeResult.error.message);
          if (agendaResult.error) throw new Error("Could not load agenda items: " + agendaResult.error.message);
          if (minutesResult.error) throw new Error("Could not load agenda notes: " + minutesResult.error.message);
          if (coverMinutesResult.error) throw new Error("Could not load meeting minutes: " + coverMinutesResult.error.message);

          const attendeesByMeeting = {};
          (attendeeResult.data || []).forEach(row => {
            if (!attendeesByMeeting[row.meeting_id]) attendeesByMeeting[row.meeting_id] = [];
            attendeesByMeeting[row.meeting_id].push(row.attendee_name || row.attendee_email || "Committee member");
          });
          const minutesByAgenda = Object.fromEntries((minutesResult.data || []).map(row => [row.agenda_item_id, row]));
          const coverMinutesByMeeting = Object.fromEntries((coverMinutesResult.data || []).map(row => [row.meeting_id, row]));
          const agendaByMeeting = {};
          (agendaResult.data || []).forEach(row => {
            if (!agendaByMeeting[row.meeting_id]) agendaByMeeting[row.meeting_id] = [];
            const minutes = minutesByAgenda[row.id] || {};
            agendaByMeeting[row.meeting_id].push({
              id: row.id,
              title: row.title,
              category: this.titleCase(row.category || "discussion"),
              description: row.description || "",
              position: row.position,
              notes: minutes.discussion_notes || "",
              decision: minutes.decision_summary || "",
              decisionStatus: minutes.decision || "none",
              minutesSaved: !!minutes.agenda_item_id,
              minutesUpdatedAt: minutes.updated_at || null,
              expanded: false
            });
          });
          this.meetings = (meetingResult.data || []).map(row => {
            const coverMinutes = coverMinutesByMeeting[row.id] || null;
            return {
              id: row.id,
              organizationId: row.organization_id,
              title: row.title,
              description: row.description || "",
              type: row.meeting_type || "committee",
              date: this.dateForTimezone(row.starts_at, row.timezone || this.currentOrganization.timezone || "Asia/Kolkata"),
              time: this.timeForTimezone(row.starts_at, row.timezone || this.currentOrganization.timezone || "Asia/Kolkata"),
              startsAt: row.starts_at,
              endsAt: row.ends_at,
              timezone: row.timezone || this.currentOrganization.timezone || "Asia/Kolkata",
              venue: row.venue || row.meeting_url || "Venue to be confirmed",
              meetingUrl: row.meeting_url || "",
              status: this.toUiMeetingStatus(row.status),
              cancelReason: row.cancellation_reason || "",
              minutesRecordId: coverMinutes?.id || null,
              minutesSummary: coverMinutes?.summary || "",
              minutesStatus: coverMinutes?.status || "draft",
              minutesPreparedBy: coverMinutes?.prepared_by || null,
              minutesFinalizedBy: coverMinutes?.finalized_by || null,
              minutesFinalizedAt: coverMinutes?.finalized_at || null,
              minutesUpdatedAt: coverMinutes?.updated_at || null,
              createdBy: row.created_by === this.authUser?.id
                ? (this.profile?.full_name || this.authUser?.email || "You")
                : "Committee member",
              updated: row.updated_at
                ? new Date(row.updated_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                : "—",
              attendees: attendeesByMeeting[row.id] || [],
              agenda: agendaByMeeting[row.id] || []
            };
          });
          this.meetingsLoaded = true;
          if (this.selectedMeeting) {
            this.selectedMeeting = this.meetings.find(m => m.id === this.selectedMeeting.id) || null;
          }
        } catch (err) {
          this.meetings = [];
          this.meetingsError = err?.message || "Could not load the meeting schedule.";
          this.meetingsLoaded = false;
        } finally {
          this.meetingsLoading = false;
        }
      },
      async loadWorkItemsFromDatabase() {
        const orgId = this.currentOrganization?.id;
        const client = window.supabaseClient;
        if (!orgId || !client) return;
        this.tasksLoading = true;
        this.tasksError = "";
        try {
          const { data, error } = await client.from("action_items")
            .select("id, organization_id, source_meeting_id, source_agenda_item_id, title, description, assignee_membership_id, due_date, priority, status, resolution_note, completed_at, cancelled_at, created_by, updated_by, created_at, updated_at")
            .eq("organization_id", orgId).order("created_at", { ascending: false });
          if (error) throw error;
          await this.loadActionMembers(orgId);
          await this.loadActionLinks(orgId);
          this.actions = (data || []).map(row => ({
            id: row.id, organizationId: row.organization_id, title: row.title,
            description: row.description || "", owner: (this.activeMembers.find(m => m.id === row.assignee_membership_id) || {}).name || "Unassigned",
            assigneeMembershipId: row.assignee_membership_id || "", due: row.due_date || "",
            priority: this.toUiPriority(row.priority), status: this.toUiActionStatus(row.status),
            resolutionNote: row.resolution_note || "", completedAt: row.completed_at,
            cancelledAt: row.cancelled_at, createdById: row.created_by || "",
            updatedById: row.updated_by || "", createdAt: row.created_at, updatedAt: row.updated_at,
            meetingId: row.source_meeting_id,
            meetingTitle: this.meetings.find(m => m.id === row.source_meeting_id)?.title || "Source meeting",
            agendaId: row.source_agenda_item_id || "",
            agendaTitle: this.meetings.flatMap(m => m.agenda || []).find(a => a.id === row.source_agenda_item_id)?.title || "General follow-up",
            links: this.workItemLinks.filter(link => link.action_item_id === row.id),
            linkedMeetingId: "", linkedMeetingTitle: "", linkedAgendaId: "", linkedAgendaTitle: ""
          }));
          this.tasksLoaded = true;
        } catch (err) {
          this.actions = [];
          this.tasksError = err?.message || "Could not load action items.";
          this.tasksLoaded = false;
        } finally { this.tasksLoading = false; }
      },
      async loadActionLinks(orgId) {
        const { data, error } = await window.supabaseClient.from("action_item_links").select("id, action_item_id, meeting_id, agenda_item_id, linked_by").eq("organization_id", orgId);
        if (error) throw error;
        this.workItemLinks = data || [];
      },
      async loadActionMembers(orgId) {
        const client = window.supabaseClient;
        const { data, error } = await client.from("organization_memberships")
          .select("id, user_id, invited_email, committee_title, role, status")
          .eq("organization_id", orgId).eq("status", "active");
        if (error) throw error;
        const rows = data || [];
        const ids = [...new Set(rows.map(row => row.user_id).filter(Boolean))];
        let profiles = [];
        if (ids.length) {
          const result = await client.from("profiles").select("id, full_name, email").in("id", ids);
          if (result.error) throw result.error;
          profiles = result.data || [];
        }
        const profileById = Object.fromEntries(profiles.map(row => [row.id, row]));
        this.activeMembers = rows.map(row => ({
          id: row.id, userId: row.user_id,
          name: profileById[row.user_id]?.full_name || profileById[row.user_id]?.email || row.invited_email || "Committee member",
          email: profileById[row.user_id]?.email || row.invited_email || "",
          committeeTitle: row.committee_title || "", role: row.role
        }));
        this.workItemMembers = Object.fromEntries(this.activeMembers.map(member => [member.id, member]));
      },
      toUiMeetingStatus(status) {
        return ({ scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" })[String(status || "").toLowerCase()] || "Scheduled";
      },
      toDbMeetingStatus(status) {
        return ({ Scheduled: "scheduled", Completed: "completed", Cancelled: "cancelled" })[status] || "scheduled";
      },
      titleCase(value) {
        return String(value || "").replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
      },
      dateForTimezone(instant, timezone) {
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit"
        }).formatToParts(new Date(instant));
        const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
        return p.year + "-" + p.month + "-" + p.day;
      },
      timeForTimezone(instant, timezone) {
        return new Intl.DateTimeFormat("en-US", {
          timeZone: timezone, hour: "numeric", minute: "2-digit", hour12: true
        }).format(new Date(instant)).replace(/\s+/g, " ").toUpperCase();
      },
      isoFromLocalDateTime(date, time, timezone) {
        const [year, month, day] = date.split("-").map(Number);
        const [hour, minute] = time.split(":").map(Number);
        const targetUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
        let candidate = targetUtc;
        for (let i = 0; i < 4; i++) {
          const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
          }).formatToParts(new Date(candidate));
          const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
          const interpretedUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
          const adjustment = targetUtc - interpretedUtc;
          candidate += adjustment;
          if (adjustment === 0) break;
        }
        return new Date(candidate).toISOString();
      },
      async loadInvitationDetails() {
        if (!this.invitationToken || !window.supabaseClient) {
          this.invitationDetails = null;
          return;
        }
        this.invitationLookupBusy = true;
        try {
          const { data, error } = await window.supabaseClient.rpc("validate_organization_invitation", {
            p_token: this.invitationToken
          });
          if (error) throw error;
          this.invitationDetails = data && typeof data === "object" ? data : { valid: false };
          if (this.invitationDetails.valid && this.invitationDetails.expires_at &&
              new Date(this.invitationDetails.expires_at).getTime() <= Date.now()) {
            this.invitationDetails = { valid: false };
          }
          if (this.invitationDetails.valid && !this.loginEmail) {
            this.loginEmail = String(this.invitationDetails.email || "").trim().toLowerCase();
          }
        } catch (err) {
          this.invitationDetails = { valid: false };
          console.warn("Invitation validation was unavailable:", err?.message || err);
        } finally {
          this.invitationLookupBusy = false;
        }
      },
      async acceptInvitation() {
        if (this.inviteAcceptBusy) return;
        if (!this.invitationToken || !this.invitationDetails?.valid || !this.invitationMatchesSignedInUser) {
          this.authError = "The invitation is invalid or does not match your verified email address.";
          return;
        }
        this.inviteAcceptBusy = true;
        this.authError = "";
        try {
          const { data, error } = await window.supabaseClient.rpc("accept_organization_invitation", {
            p_token: this.invitationToken
          });
          if (error) throw error;
          if (!data) throw new Error("The invitation could not activate a committee membership.");
          this.invitationToken = "";
          this.invitationDetails = null;
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("invite");
          window.history.replaceState(null, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
          await this.loadUserContext(this.authSession, true);
          if (this.authState === "ready") this.toast("Committee invitation accepted. Your membership is active.");
        } catch (err) {
          this.authError = err?.message || "Could not accept this invitation.";
        } finally {
          this.inviteAcceptBusy = false;
        }
      },
      async loadInvitationRoster() {
        if (!this.canManageInvitations || !this.currentOrganization?.id || this.membersLoading) return;
        this.membersLoading = true;
        this.rosterError = "";
        this.invitationError = "";
        try {
          const orgId = this.currentOrganization.id;
          const [invitesResult, membersResult] = await Promise.all([
            window.supabaseClient.rpc("list_organization_invitations", { p_organization_id: orgId }),
            window.supabaseClient.from("organization_memberships")
              .select("id, user_id, invited_email, committee_title, role, status, created_at")
              .eq("organization_id", orgId).eq("status", "active")
              .order("created_at", { ascending: true })
          ]);
          if (invitesResult.error) throw new Error("Invitations could not be loaded: " + invitesResult.error.message);
          if (membersResult.error) throw new Error("Could not load active members: " + membersResult.error.message);
          const rows = membersResult.data || [];
          const userIds = [...new Set(rows.map(row => row.user_id).filter(Boolean))];
          let profileRows = [];
          if (userIds.length) {
            const profilesResult = await window.supabaseClient.from("profiles")
              .select("id, full_name, email").in("id", userIds);
            if (profilesResult.error) throw new Error("Could not load member profiles: " + profilesResult.error.message);
            profileRows = profilesResult.data || [];
          }
          const profilesByUserId = Object.fromEntries(profileRows.map(row => [row.id, row]));
          this.organizationMembers = rows.map(row => {
            const profile = profilesByUserId[row.user_id] || {};
            const email = profile.email || row.invited_email || "";
            return {
              id: row.id, userId: row.user_id, email,
              name: String(profile.full_name || row.committee_title || email || "Committee member").trim(),
              role: row.role, status: row.status
            };
          }).sort((a,b) => ({owner:0,admin:1,member:2,viewer:3}[a.role] ?? 4) - ({owner:0,admin:1,member:2,viewer:3}[b.role] ?? 4) || a.name.localeCompare(b.name));
          this.invitationRows = Array.isArray(invitesResult.data) ? invitesResult.data : [];
        } catch (err) {
          this.rosterError = err?.message || "Could not load the access roster.";
        } finally {
          this.membersLoading = false;
        }
      },
      async createInvitation() {
        if (!this.canManageInvitations || !this.currentOrganization?.id || this.inviteBusy) {
          this.invitationError = "Only an active owner can create invitations.";
          return;
        }
        const email = String(this.inviteEmail || "").trim().toLowerCase();
        const role = String(this.inviteRole || "member");
        if (!email || !email.includes("@")) {
          this.invitationError = "Enter a valid email address.";
          return;
        }
        if (!["owner","admin","member"].includes(role)) {
          this.invitationError = "Choose a valid membership role.";
          return;
        }
        this.inviteBusy = true;
        this.invitationError = "";
        this.invitationMessage = "";
        this.invitationLink = "";
        try {
          const { data, error } = await window.supabaseClient.rpc("create_organization_invitation", {
            p_organization_id: this.currentOrganization.id,
            p_email: email,
            p_role: role
          });
          if (error) throw error;
          if (!data?.token) throw new Error("The invitation service did not return a secure invitation token.");
          const link = new URL("/", window.location.origin);
          link.searchParams.set("invite", data.token);
          const { error: emailError } = await window.supabaseClient.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: link.toString(),
              shouldCreateUser: true
            }
          });
          this.inviteEmail = "";
          this.inviteRole = "member";
          if (emailError) {
            // The DB invitation is already pending. Expose its token only as a
            // one-time manual fallback when Supabase cannot send the magic link.
            this.invitationLink = link.toString();
            this.invitationError = "The invitation was saved, but we couldn't send the sign-in email: " + emailError.message + ". Copy the fallback link below and send it privately to the invited address.";
            this.invitationMessage = "Invitation saved for " + email + "; email delivery needs attention.";
          } else {
            this.invitationLink = "";
            this.invitationMessage = "A sign-in link has been requested for " + email + ". After signing in, the invitee must accept the invitation before committee access is activated.";
          }
          await this.loadInvitationRoster();
        } catch (err) {
          this.invitationError = err?.message || "Could not create this invitation.";
        } finally {
          this.inviteBusy = false;
        }
      },
      async revokeInvitation(invitationId) {
        if (!this.canManageInvitations || this.inviteRevokeBusy) return;
        const inv = this.invitationRows.find(row => row.id === invitationId);
        if (!inv || inv.status !== "pending") return;
        if (!window.confirm("Revoke the pending invitation for " + inv.email + "? The link will stop working.")) return;
        this.inviteRevokeBusy = true;
        this.invitationError = "";
        try {
          const { data, error } = await window.supabaseClient.rpc("revoke_organization_invitation", {
            p_invitation_id: invitationId
          });
          if (error) throw error;
          if (!data) throw new Error("This invitation is no longer pending.");
          this.invitationMessage = "Invitation revoked. Its link can no longer be accepted.";
          await this.loadInvitationRoster();
        } catch (err) {
          this.invitationError = err?.message || "Could not revoke this invitation.";
        } finally {
          this.inviteRevokeBusy = false;
        }
      },
      async copyInvitationLink() {
        if (!this.invitationLink) return;
        try {
          await navigator.clipboard.writeText(this.invitationLink);
          this.toast("Private invitation link copied.");
        } catch (err) {
          const field = document.querySelector(".invitation-link-row input");
          if (field) { field.focus(); field.select(); }
          this.toast("Select the invitation link and copy it manually.");
        }
      },
      formatInvitationDate(value) {
        if (!value) return "—";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
      },
      async createOrganization() {
        this.authError = "Self-service workspace creation is disabled. Ask the committee owner for an invitation.";
        this.authState = "noMembership";
        return;
      },
      async legacyCreateOrganizationDisabled() {
        this.authError = "Self-service workspace creation is disabled. Ask the committee owner for an invitation.";
        this.authState = "noMembership";
        return;
      },
      async retryAuth() {
        this.authError = "";
        this.authState = "checking";
        try {
          const { data, error } = await window.supabaseClient.auth.getSession();
          if (error) throw error;
          if (data?.session) await this.loadUserContext(data.session, true);
          else this.authState = "signedOut";
        } catch (err) {
          this.authError = err?.message || "Could not verify the session.";
          this.authState = "error";
        }
      },
      async signOut() {
        try {
          const { error } = await window.supabaseClient.auth.signOut({ scope: "local" });
          if (error) throw error;
          this.resetAuthContext();
          this.authState = "signedOut";
          this.go("dashboard");
        } catch (err) {
          this.authError = err?.message || "Could not sign out.";
          this.toast("Sign-out failed. Please try again.");
        }
      },
      resetAuthContext() {
        this.authUser = null;
        this.authSession = null;
        this.profile = null;
        this.memberships = [];
        this.currentMembership = null;
        this.currentOrganization = null;
        this.selectedMembershipId = "";
        this.invitationRows = [];
        this.organizationMembers = [];
        this.membersLoading = false;
        this.rosterError = "";
        this.invitationError = "";
        this.invitationMessage = "";
        this.invitationLink = "";
        this.showMeetingModal = false;
        this.showAgendaModal = false;
        this.showActionModal = false;
        this.showCancelModal = false;
      },
      slugify(value) {
        return String(value || "").normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      },
      roleLabel(role) {
        return ({ owner: "Workspace owner", admin: "Committee admin", member: "Committee member", viewer: "Read-only viewer" })[role] || "Committee member";
      },
      todayLabel() {
        return new Intl.DateTimeFormat("en-IN", {
          timeZone: this.currentOrganization?.timezone || "Asia/Kolkata",
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        }).format(new Date()).toUpperCase();
      },
      greeting() {
        const hour = Number(new Intl.DateTimeFormat("en-GB", {
          timeZone: this.currentOrganization?.timezone || "Asia/Kolkata",
          hour: "2-digit", hourCycle: "h23"
        }).format(new Date()));
        return hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";
      },
      get upcomingCount() { return this.meetings.filter(m => m.status === "Scheduled").length; },
      get openCount() { return this.actions.filter(a => !["Completed", "Cancelled"].includes(a.status)).length; },
      get overdueCount() { return this.actions.filter(a => !["Completed", "Cancelled"].includes(a.status) && a.due && a.due < this.demoToday).length; },
      get owners() { return [...new Set(this.actions.map(a => a.owner))].sort(); },
      get carouselMeetings() {
        const upcoming = this.meetings.filter(m => m.status === "Scheduled").sort((a,b) => a.date.localeCompare(b.date));
        const past = this.meetings.filter(m => m.status !== "Scheduled").sort((a,b) => b.date.localeCompare(a.date));
        return [...upcoming, ...past];
      },
      get filteredMeetings() {
        const q = this.meetingSearch.toLowerCase().trim();
        return this.meetings.filter(m => (this.meetingFilter === "All" || m.status === this.meetingFilter) && (this.meetingYear === "All" || m.date.startsWith(this.meetingYear)) && (!q || [m.title,m.venue,m.description,m.id].join(" ").toLowerCase().includes(q))).sort((a,b) => b.date.localeCompare(a.date));
      },
      get filteredActions() {
        const q = this.actionSearch.toLowerCase().trim();
        return this.actions.filter(a => {
          const statusOk = this.actionFilter === "All" ||
            (this.actionFilter === "Open items" ? !["Completed", "Cancelled"].includes(a.status) : a.status === this.actionFilter);
          return statusOk && (this.ownerFilter === "All" || a.owner === this.ownerFilter) &&
            (!q || [a.title, a.description, a.owner, a.meetingTitle, a.agendaTitle, a.status, a.priority].join(" ").toLowerCase().includes(q));
        }).sort((a,b) => {
          const aDone = ["Completed", "Cancelled"].includes(a.status);
          const bDone = ["Completed", "Cancelled"].includes(b.status);
          if (aDone && !bDone) return 1;
          if (!aDone && bDone) return -1;
          if (!a.due) return 1;
          if (!b.due) return -1;
          return a.due.localeCompare(b.due);
        });
      },
      get carryForwardActions() {
        const meeting = this.selectedMeeting;
        if (!meeting) return [];
        return this.actions.filter(a => ["Open", "In Progress"].includes(a.status) && a.meetingId !== meeting.id && !this.workItemLinks.some(link => link.action_item_id === a.id && link.meeting_id === meeting.id));
      },
      get selectedMeetingLinks() { return []; },
      get minutesMeetings() {
        const q = this.minutesSearch.toLowerCase().trim();
        return this.meetings.filter(m =>
          (m.status === "Completed" || m.minutesRecordId || m.minutesSummary || m.agenda.some(a => a.minutesSaved || a.notes || a.decision || a.decisionStatus !== "none")) &&
          (this.minutesYear === "All" || m.date.startsWith(this.minutesYear)) &&
          (!q || [m.title, m.venue, m.minutesSummary, this.minutesStatusLabel(m.minutesStatus), ...m.agenda.map(a => a.title + " " + a.notes + " " + a.decision)].join(" ").toLowerCase().includes(q))
        ).sort((a,b) => b.date.localeCompare(a.date));
      },
      minutesStatusLabel(status) {
        return ({ draft: "Draft", in_review: "In review", final: "Final" })[String(status || "draft")] || "Draft";
      },
      get filteredReminders() {
        return this.reminders.filter(r => !r.cancelled && (this.reminderFilter === "All" || (this.reminderFilter === "Scheduled" ? !r.sent : r.sent))).sort((a,b) => a.date.localeCompare(b.date));
      },
      go(page, filter) {
        if (page === "members" && !this.canManageInvitations) {
          this.toast("Only the committee owner can manage members and invitations.");
          return;
        }
        this.page = page; this.mobileNav = false;
        const titles = { dashboard: "Dashboard", meetings: "Meeting schedule", detail: "Meeting details", actionItems: "Open action items", minutes: "Meeting minutes", reminders: "Reminders", members: "Members & invitations" };
        this.pageTitle = titles[page] || "Dashboard";
        if (filter) this.meetingFilter = filter;
        if (page === "members") this.loadInvitationRoster();
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openMeeting(id) {
        this.selectedMeeting = this.meetings.find(m => m.id === id) || null;
        if (this.selectedMeeting) {
          this.selectedMeeting.agenda.forEach(a => { if (typeof a.expanded !== "boolean") a.expanded = false; });
          this.go("detail");
          this.pageTitle = "Meeting details";
        } else {
          this.toast("This action item is no longer available. Refresh the list and try again.");
        }
      },
      scrollCarousel(direction) {
        const el = document.getElementById("meetingCarousel");
        if (el) el.scrollBy({ left: direction * Math.max(270, el.clientWidth * .72), behavior: "smooth" });
      },
      openCreate() {
        if (!this.canManageMeetings) {
          this.toast("Only committee admins can schedule meetings.");
          return;
        }
        this.editingMeetingId = null;
        this.meetingForm = {
          title: "", date: this.defaultMeetingDate(), time: "18:30",
          venue: "Society clubhouse", status: "Scheduled", attendees: "", description: "", cancelReason: ""
        };
        this.showMeetingModal = true;
      },
      editMeeting(id) {
        if (!this.canManageMeetings) {
          this.toast("Only committee admins can edit meetings.");
          return;
        }
        const m = this.meetings.find(x => x.id === id);
        if (!m) return;
        this.editingMeetingId = id;
        this.meetingForm = {
          title: m.title, date: m.date, time: this.toTimeInput(m.time), venue: m.venue,
          status: m.status, attendees: m.attendees.join(", "), description: m.description || "",
          cancelReason: m.cancelReason || ""
        };
        this.showMeetingModal = true;
      },
      defaultMeetingDate() {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      },
      toTimeInput(time) {
        const match = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return "18:30";
        let h = Number(match[1]) % 12;
        if (match[3].toUpperCase() === "PM") h += 12;
        return String(h).padStart(2, "0") + ":" + match[2];
      },
      toDisplayTime(time) {
        if (!time) return "";
        const [hh, mm] = time.split(":").map(Number);
        const suffix = hh >= 12 ? "PM" : "AM";
        return (hh % 12 || 12) + ":" + String(mm).padStart(2, "0") + " " + suffix;
      },
      async saveMeetingAttendees(meetingId, attendeeNames) {
        const client = window.supabaseClient;
        const orgId = this.currentOrganization?.id;
        const { error: deleteError } = await client.from("meeting_attendees")
          .delete().eq("organization_id", orgId).eq("meeting_id", meetingId);
        if (deleteError) throw deleteError;
        const rows = attendeeNames.map(name => ({
          organization_id: orgId,
          meeting_id: meetingId,
          attendee_name: name
        }));
        if (rows.length) {
          const { error: insertError } = await client.from("meeting_attendees").insert(rows);
          if (insertError) throw insertError;
        }
      },
      async saveMeeting() {
        const f = this.meetingForm;
        if (!this.canManageMeetings) {
          this.toast("Only committee admins can schedule or edit meetings.");
          return;
        }
        if (!this.authSession?.user || !this.currentOrganization?.id) {
          this.toast("Your committee session is not ready. Please sign in again.");
          return;
        }
        if (!f.title.trim() || !f.date || !f.time || !f.venue.trim()) {
          this.toast("Please complete the required fields");
          return;
        }
        if (this.meetingSaveBusy) return;
        const timezone = this.currentOrganization.timezone || "Asia/Kolkata";
        let startsAt;
        try {
          startsAt = this.isoFromLocalDateTime(f.date, f.time, timezone);
        } catch (err) {
          this.toast("The meeting date/time is invalid for this workspace time zone.");
          return;
        }
        const status = this.toDbMeetingStatus(f.status);
        const payload = {
          title: f.title.trim(),
          description: (f.description || "").trim(),
          meeting_type: "committee",
          starts_at: startsAt,
          timezone,
          venue: f.venue.trim(),
          status,
          cancellation_reason: status === "cancelled" ? ((f.cancelReason || "").trim() || "Cancelled during scheduling.") : null,
          updated_by: this.authUser.id
        };
        this.meetingSaveBusy = true;
        let meetingId = this.editingMeetingId;
        try {
          const client = window.supabaseClient;
          if (this.editingMeetingId) {
            const { data, error } = await client.from("meetings")
              .update(payload)
              .eq("id", this.editingMeetingId)
              .eq("organization_id", this.currentOrganization.id)
              .select("id")
              .maybeSingle();
            if (error) throw error;
            if (!data) throw new Error("The meeting was not updated. Check your role and organization access.");
            meetingId = data.id;
          } else {
            const { data, error } = await client.from("meetings")
              .insert({ ...payload, organization_id: this.currentOrganization.id })
              .select("id")
              .single();
            if (error) throw error;
            meetingId = data.id;
          }

          let attendeeWarning = "";
          try {
            const names = String(f.attendees || "").split(",").map(name => name.trim()).filter(Boolean);
            await this.saveMeetingAttendees(meetingId, names);
          } catch (attendeeError) {
            attendeeWarning = " The meeting was saved, but attendees could not be saved: " + (attendeeError.message || "permission issue or temporary error");
          }

          this.showMeetingModal = false;
          this.editingMeetingId = null;
          await this.loadMeetingsFromDatabase();
          if (meetingId && !this.editingMeetingId) {
            const savedMeeting = this.meetings.find(m => m.id === meetingId);
            if (savedMeeting) {
              this.selectedMeeting = savedMeeting;
              this.go("detail");
              this.pageTitle = "Meeting details";
            }
          }
          this.toast("Meeting saved." + attendeeWarning);
        } catch (err) {
          this.toast("Could not save meeting: " + (err?.message || "Unexpected error"));
        } finally {
          this.meetingSaveBusy = false;
        }
      },
      createReminders(m) {
        const [h,mins]=m.time.split(/[: ]/); let hour=Number(h)%12; if(m.time.includes("PM"))hour+=12;
        const base=new Date(m.date+"T"+String(hour).padStart(2,"0")+":"+mins+":00");
        const offsets=[]; if(this.settings.dayBefore) offsets.push({mins:1440,label:"24 hours before"}); if(this.settings.hourBefore) offsets.push({mins:60,label:"1 hour before"});
        offsets.forEach((o,i)=>{const d=new Date(base.getTime()-o.mins*60000);this.reminders.push({id:"rem-"+Date.now()+"-"+i,meetingId:m.id,title:m.title,date:d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),time:this.toDisplayTime(String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")),meetingTime:m.time,offset:o.label,channel:"In-app demo",sent:false,cancelled:false});});
      },
      addAgendaItem() {
        if (!this.canManageMeetings) { this.toast("Only committee admins can manage agenda items."); return; }
        if (!this.selectedMeeting || this.selectedMeeting.status !== "Scheduled") { this.toast("Only scheduled meetings can be edited."); return; }
        this.editingAgendaId = null;
        this.agendaForm = { title: "", category: "Discussion", description: "" };
        this.showAgendaModal = true;
      },
      editAgenda(id) {
        if (!this.canManageMeetings) { this.toast("Only committee admins can manage agenda items."); return; }
        const item = this.selectedMeeting?.agenda.find(x => x.id === id);
        if (!item) return;
        this.editingAgendaId = id;
        this.agendaForm = { title: item.title, category: item.category, description: item.description || "" };
        this.showAgendaModal = true;
      },
      async saveAgendaItem() {
        const meeting = this.selectedMeeting;
        const title = String(this.agendaForm.title || "").trim();
        if (!this.canManageMeetings) { this.toast("Only committee admins can manage agenda items."); return; }
        if (!meeting || meeting.status !== "Scheduled") { this.toast("Only scheduled meetings can be edited."); return; }
        if (!title) { this.toast("Enter an agenda item title."); return; }
        if (this.agendaSaveBusy) return;
        const client = window.supabaseClient;
        const orgId = this.currentOrganization?.id;
        if (!client || !orgId) { this.toast("Committee session is not ready."); return; }
        const values = {
          title,
          category: String(this.agendaForm.category || "Discussion").toLowerCase(),
          description: String(this.agendaForm.description || "").trim(),
          updated_by: this.authUser.id
        };
        this.agendaSaveBusy = true;
        try {
          if (this.editingAgendaId) {
            const { data, error } = await client.from("agenda_items").update(values)
              .eq("id", this.editingAgendaId).eq("meeting_id", meeting.id).eq("organization_id", orgId)
              .select("id").maybeSingle();
            if (error) throw error;
            if (!data) throw new Error("Agenda item was not updated. Check your role and access.");
          } else {
            const nextPosition = Math.max(0, ...meeting.agenda.map(item => Number(item.position) || 0)) + 1;
            const { error } = await client.from("agenda_items").insert({
              ...values, organization_id: orgId, meeting_id: meeting.id, position: nextPosition, created_by: this.authUser.id
            });
            if (error) throw error;
          }
          const wasEdit = !!this.editingAgendaId;
          this.showAgendaModal = false;
          this.editingAgendaId = null;
          await this.loadMeetingsFromDatabase();
          this.toast(wasEdit ? "Agenda item updated." : "Agenda item added.");
        } catch (err) {
          this.toast("Could not save agenda item: " + (err?.message || "Database error"));
        } finally {
          this.agendaSaveBusy = false;
        }
      },
      async moveAgenda(id, direction) {
        const meeting = this.selectedMeeting;
        if (!this.canManageMeetings) { this.toast("Only committee admins can reorder agenda items."); return; }
        if (!meeting || meeting.status !== "Scheduled") return;
        const original = meeting.agenda.slice();
        const next = original.slice();
        const i = next.findIndex(item => item.id === id);
        const j = i + direction;
        if (i < 0 || j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j], next[i]];
        const client = window.supabaseClient;
        const orgId = this.currentOrganization?.id;
        try {
          const maxPosition = Math.max(0, ...original.map(item => Number(item.position) || 0));
          for (let index = 0; index < next.length; index++) {
            const { error } = await client.from("agenda_items").update({ position: maxPosition + next.length + index + 10, updated_by: this.authUser.id })
              .eq("id", next[index].id).eq("meeting_id", meeting.id).eq("organization_id", orgId);
            if (error) throw error;
          }
          for (let index = 0; index < next.length; index++) {
            const { error } = await client.from("agenda_items").update({ position: index + 1, updated_by: this.authUser.id })
              .eq("id", next[index].id).eq("meeting_id", meeting.id).eq("organization_id", orgId);
            if (error) throw error;
          }
          await this.loadMeetingsFromDatabase();
          this.toast("Agenda order saved.");
        } catch (err) {
          await this.loadMeetingsFromDatabase();
          this.toast("Could not reorder agenda: " + (err?.message || "Database error"));
        }
      },
      async removeAgenda(id) {
        const meeting = this.selectedMeeting;
        if (!this.canManageMeetings) { this.toast("Only committee admins can remove agenda items."); return; }
        if (!meeting) return;
        if (this.actions.some(action => action.agendaId === id)) { this.toast("This agenda item has linked action items in the current view. Keep it for the record."); return; }
        const item = meeting.agenda.find(a => a.id === id);
        if (!item || !confirm("Remove agenda item “" + item.title + "”? Its linked minutes will also be removed.")) return;
        try {
          const { data, error } = await window.supabaseClient.from("agenda_items").delete()
            .eq("id", id).eq("meeting_id", meeting.id).eq("organization_id", this.currentOrganization.id)
            .select("id").maybeSingle();
          if (error) throw error;
          if (!data) throw new Error("Agenda item was not removed. Check your role and organization access.");
          await this.loadMeetingsFromDatabase();
          this.toast("Agenda item removed.");
        } catch (err) {
          this.toast("Could not remove agenda item: " + (err?.message || "A linked action item may depend on it."));
        }
      },
      async saveAgendaNote(id) {
        const agenda = this.selectedMeeting?.agenda.find(item => item.id === id);
        const meeting = this.selectedMeeting;
        const orgId = this.currentOrganization?.id;
        const client = window.supabaseClient;
        if (!agenda || !meeting || !client || !orgId) return;
        if (!this.canRecordMinutes) { this.toast("Your role does not allow recording minutes."); return; }
        if (meeting.minutesStatus === "final") { this.toast("These minutes are final. Ask an administrator to reopen them for corrections."); return; }
        if (this.agendaNoteSaveBusy) return;
        const values = {
          discussion_notes: String(agenda.notes || "").trim(),
          decision_summary: String(agenda.decision || "").trim(),
          decision: String(agenda.decisionStatus || "none").toLowerCase(),
          updated_by: this.authUser.id,
          recorded_at: new Date().toISOString()
        };
        this.agendaNoteSaveBusy = true;
        try {
          if (agenda.minutesSaved) {
            const { data, error } = await client.from("agenda_item_minutes").update(values)
              .eq("organization_id", orgId).eq("meeting_id", meeting.id).eq("agenda_item_id", agenda.id)
              .select("agenda_item_id").maybeSingle();
            if (error) throw error;
            if (!data) throw new Error("Minutes were not updated. Refresh the meeting and try again.");
          } else {
            const { error } = await client.from("agenda_item_minutes").insert({
              ...values,
              organization_id: orgId,
              meeting_id: meeting.id,
              agenda_item_id: agenda.id,
              recorded_by: this.authUser.id
            });
            if (error) throw error;
          }
          await this.loadMeetingsFromDatabase();
          this.toast("Agenda notes and decision saved.");
        } catch (err) {
          this.toast("Could not save agenda minutes: " + (err?.message || "Database error"));
        } finally {
          this.agendaNoteSaveBusy = false;
        }
      },
      async saveMeetingMinutes(targetStatus = null) {
        const meeting = this.selectedMeeting;
        const orgId = this.currentOrganization?.id;
        const client = window.supabaseClient;
        if (!meeting || !client || !orgId) return;
        if (!this.canRecordMinutes) { this.toast("Your role does not allow recording meeting minutes."); return; }
        if (meeting.minutesStatus === "final" && targetStatus !== "draft") {
          this.toast("Final minutes are locked. An administrator must reopen them first.");
          return;
        }
        if (targetStatus && targetStatus !== meeting.minutesStatus && !this.canManageMeetings) {
          this.toast("Only a committee administrator can change the minutes workflow status.");
          return;
        }
        if (this.minutesSaveBusy) return;
        const currentStatus = meeting.minutesStatus || "draft";
        const status = targetStatus || currentStatus;
        if (!this.canManageMeetings && (currentStatus !== "draft" || status !== "draft")) {
          this.toast("Committee members can edit draft minutes; an administrator manages review and finalization.");
          return;
        }
        const payload = {
          summary: String(meeting.minutesSummary || "").trim(),
          status,
          finalized_by: status === "final" ? this.authUser.id : null,
          finalized_at: status === "final" ? new Date().toISOString() : null
        };
        if (status === "final" && !payload.summary && !meeting.agenda.some(item =>
          String(item.notes || "").trim() || String(item.decision || "").trim() || item.decisionStatus !== "none"
        )) {
          this.toast("Add a meeting summary or record at least one agenda discussion/decision before finalizing.");
          return;
        }
        this.minutesSaveBusy = true;
        try {
          if (meeting.minutesRecordId) {
            const { data, error } = await client.from("meeting_minutes").update(payload)
              .eq("organization_id", orgId).eq("meeting_id", meeting.id)
              .select("id").maybeSingle();
            if (error) throw error;
            if (!data) throw new Error("Minutes were not updated. Check your role or whether they are already final.");
          } else {
            const { error } = await client.from("meeting_minutes").insert({
              organization_id: orgId,
              meeting_id: meeting.id,
              summary: payload.summary,
              status,
              prepared_by: this.authUser.id,
              finalized_by: payload.finalized_by,
              finalized_at: payload.finalized_at
            });
            if (error) throw error;
          }
          await this.loadMeetingsFromDatabase();
          this.toast(status === "final" ? "Meeting minutes finalized." : status === "in_review" ? "Meeting minutes submitted for review." : "Meeting minutes draft saved.");
        } catch (err) {
          this.toast("Could not save meeting minutes: " + (err?.message || "Database error"));
        } finally {
          this.minutesSaveBusy = false;
        }
      },
      get canEditAgendaMinutes() {
        return this.canRecordMinutes && this.selectedMeeting?.minutesStatus !== "final";
      },
      async persistMeetingStatus(id, status, cancellationReason = "") {
        if (!this.canManageMeetings) {
          this.toast("Only committee admins can change meeting status.");
          return false;
        }
        const meeting = this.meetings.find(item => item.id === id);
        if (!meeting || !this.currentOrganization?.id) return false;
        const dbStatus = this.toDbMeetingStatus(status);
        const payload = {
          status: dbStatus,
          cancellation_reason: dbStatus === "cancelled"
            ? (String(cancellationReason || "").trim() || "Cancelled by committee.")
            : null,
          updated_by: this.authUser.id
        };
        try {
          const { data, error } = await window.supabaseClient.from("meetings")
            .update(payload)
            .eq("id", id)
            .eq("organization_id", this.currentOrganization.id)
            .select("id, status")
            .maybeSingle();
          if (error) throw error;
          if (!data) throw new Error("The meeting status was not updated. Check your role and organization access.");
          await this.loadMeetingsFromDatabase();
          this.selectedMeeting = this.meetings.find(item => item.id === id) || null;
          this.toast(status === "Completed"
            ? "Meeting marked completed. Open actions remain open."
            : status === "Cancelled"
              ? "Meeting cancelled; record retained."
              : "Meeting status updated.");
          return true;
        } catch (err) {
          this.toast("Could not update meeting status: " + (err?.message || "Database error"));
          return false;
        }
      },
      async completeMeeting(id) {
        return await this.persistMeetingStatus(id, "Completed");
      },
      async setMeetingStatus(id, status) {
        if (status === "Cancelled") {
          this.cancelMeeting(id);
          return;
        }
        return await this.persistMeetingStatus(id, status);
      },
      cancelMeeting(id) {
        if (!this.canManageMeetings) {
          this.toast("Only committee admins can cancel meetings.");
          return;
        }
        this.cancelTargetId = id;
        const meeting = this.meetings.find(item => item.id === id);
        this.cancelReason = meeting?.cancelReason || "";
        this.showCancelModal = true;
      },
      async confirmCancel() {
        if (!this.cancelTargetId) return;
        const reason = this.cancelReason.trim() || "Cancelled by committee.";
        const saved = await this.persistMeetingStatus(this.cancelTargetId, "Cancelled", reason);
        if (saved) {
          this.showCancelModal = false;
          this.cancelTargetId = null;
        }
      },
      async updateActionStatus(id, status) {
        const action = this.actions.find(item => item.id === id);
        if (!action || !this.currentOrganization?.id) return false;
        if (!this.canEditAction(action)) { this.toast("You can update only actions you created or are assigned to."); await this.loadWorkItemsFromDatabase(); return false; }
        if (this.taskStatusBusy) return false;
        this.taskStatusBusy = true;
        try {
          const { data, error } = await window.supabaseClient.from("action_items")
            .update({ status: this.toDbActionStatus(status), updated_by: this.authUser.id })
            .eq("id", id).eq("organization_id", this.currentOrganization.id)
            .select("id").maybeSingle();
          if (error) throw error;
          if (!data) throw new Error("Action status was not updated. Check your access to this item.");
          await this.loadWorkItemsFromDatabase();
          this.toast("Action status saved.");
          return true;
        } catch (err) {
          await this.loadWorkItemsFromDatabase();
          this.toast("Could not update action status: " + (err?.message || "Database error"));
          return false;
        } finally { this.taskStatusBusy = false; }
      },
      async completeAction(id) { return await this.updateActionStatus(id, "Completed"); },
      async toggleAction(id) {
        const action = this.actions.find(item => item.id === id);
        if (!action) return;
        const nextStatus = action.status === "Completed" ? "Open" : "Completed";
        return await this.updateActionStatus(id, nextStatus);
      },
      openActionCreate() {
        if (!this.canContributeActions) { this.toast("Your role is read-only for action items."); return; }
        const next = this.meetings.filter(m => m.status === "Scheduled").sort((a,b) => a.date.localeCompare(b.date))[0] || this.meetings[0];
        if (!next) { this.toast("Schedule a meeting before creating an action item."); return; }
        this.editingActionId = null;
        this.actionForm = {
          title: "", description: "", assigneeMembershipId: "", due: this.defaultMeetingDate(),
          meetingId: next.id, agendaId: "", priority: "Normal", status: "Open"
        };
        this.showActionModal = true;
      },
      async unlinkAction(actionId, linkId) {
        const action=this.actions.find(a=>a.id===actionId);
        const link=this.workItemLinks.find(item=>item.id===linkId&&item.action_item_id===actionId);
        const org=this.currentOrganization?.id;
        if(!action||!link||!org)return;
        if(!this.canManageActions&&link.linked_by!==this.authUser?.id){this.toast("Only an administrator or the person who added the link can remove it.");return;}
        try{
          const {data,error}=await window.supabaseClient.from("action_item_links").delete()
            .eq("id",linkId).eq("organization_id",org).select("id").maybeSingle();
          if(error)throw error;
          if(!data)throw new Error("The carry-forward link was not removed.");
          await this.loadWorkItemsFromDatabase();
          this.toast("Carry-forward link removed. The original action remains in its source meeting.");
        }catch(err){this.toast("Could not remove link: "+(err?.message||"Database error"));}
      },
      editAction(id) {
        const action = this.actions.find(item => item.id === id);
        if (!action) return;
        if (!this.canEditAction(action)) { this.toast("You can edit only actions you created or are assigned to."); return; }
        this.editingActionId = id;
        this.actionForm = {
          title: action.title, description: action.description || "",
          assigneeMembershipId: action.assigneeMembershipId || "", due: action.due || "",
          meetingId: action.meetingId, agendaId: action.agendaId || "",
          priority: action.priority || "Normal", status: action.status
        };
        this.showActionModal = true;
      },
      async saveAction() {
        const f=this.actionForm, org=this.currentOrganization?.id, client=window.supabaseClient;
        const m=this.meetings.find(x=>x.id===f.meetingId), a=this.editingActionId?this.actions.find(x=>x.id===this.editingActionId):null;
        if(!this.canContributeActions||!org||!client){this.toast("Action-item changes are not permitted.");return;}
        if(!String(f.title||"").trim()||!m){this.toast("Enter an action title and select a source meeting.");return;}
        if(this.editingActionId&&(!a||!this.canEditAction(a))){this.toast("You cannot edit this action item.");return;}
        if(this.taskSaveBusy)return;
        const p={title:f.title.trim(),description:String(f.description||"").trim(),assignee_membership_id:f.assigneeMembershipId||null,due_date:f.due||null,priority:this.toDbPriority(f.priority),status:this.toDbActionStatus(f.status),updated_by:this.authUser.id};
        this.taskSaveBusy=true;
        try{
          let result;
          if(a) result=await client.from("action_items").update(p).eq("id",a.id).eq("organization_id",org).select("id").maybeSingle();
          else result=await client.from("action_items").insert({...p,organization_id:org,source_meeting_id:m.id,source_agenda_item_id:f.agendaId||null,created_by:this.authUser.id});
          if(result.error)throw result.error;
          if(a&&!result.data)throw new Error("Action item was not updated.");
          this.showActionModal=false;this.editingActionId=null;
          await this.loadWorkItemsFromDatabase();
          this.toast(a?"Action item updated.":"Action item saved.");
        }catch(err){this.toast("Could not save action item: "+(err?.message||"Database error"));}
        finally{this.taskSaveBusy=false;}
      },
      async carryActionToMeeting() {
        const meeting=this.selectedMeeting, org=this.currentOrganization?.id, client=window.supabaseClient;
        const action=this.actions.find(a=>a.id===this.carryActionId);
        if(!meeting||!org||!client||!this.canContributeActions){this.toast("Your role does not allow carry-forward.");return;}
        if(!action||!["Open","In Progress"].includes(action.status)||action.meetingId===meeting.id){this.toast("Choose an unresolved action from an earlier meeting.");return;}
        if(this.carryAgendaId&&!meeting.agenda.some(a=>a.id===this.carryAgendaId)){this.toast("Choose an agenda item from this meeting.");return;}
        if(this.workItemLinks.some(l=>l.action_item_id===action.id&&l.meeting_id===meeting.id)){this.toast("This action is already linked to this meeting.");return;}
        if(this.carrySaveBusy)return;
        this.carrySaveBusy=true;
        try{
          const {error}=await client.from("action_item_links").insert({
            organization_id:org,action_item_id:action.id,meeting_id:meeting.id,
            agenda_item_id:this.carryAgendaId||null,linked_by:this.authUser.id,
            link_note:"Carried forward; original meeting and agenda retained."
          });
          if(error)throw error;
          await this.loadWorkItemsFromDatabase();
          this.carryActionId="";this.carryAgendaId="";
          this.toast("Action carried forward to this meeting. Its original source remains unchanged.");
        }catch(err){this.toast("Could not carry action forward: "+(err?.message||"Database error"));}
        finally{this.carrySaveBusy=false;}
      },
      simulateReminder(id) {
        const r=this.reminders.find(x=>x.id===id);if(!r)return;r.sent=true;this.toast("Demo reminder simulated — no message sent");
      },
      statusClass(status) { return "status-"+String(status).toLowerCase(); },
      actionStatusClass(status) { return "status-"+String(status).toLowerCase().replace(/\s+/g,"-"); },
      dueClass(due) { if (!due) return ""; if (due < this.demoToday) return "due-overdue"; const delta = this.dateObj(due).getTime() - this.dateObj(this.demoToday).getTime(); return delta <= 259200000 ? "due-soon" : ""; },
      initials(name) { return String(name||"").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join(""); },
      dateObj(date) { return new Date(date+"T12:00:00"); },
      monthShort(date) { return this.dateObj(date).toLocaleDateString("en-IN",{month:"short"}).toUpperCase(); },
      dayNum(date) { return this.dateObj(date).getDate(); },
      weekday(date) { return this.dateObj(date).toLocaleDateString("en-IN",{weekday:"short"}); },
      formatLong(date) { return this.dateObj(date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); },
      formatShort(date) { return this.dateObj(date).toLocaleDateString("en-IN",{day:"numeric",month:"short"}); },
      sortMeetings() { this.meetings.sort((a,b)=>a.date.localeCompare(b.date)); },
      toast(message) {
        this.toastMessage=message;
        if(this.toastTimer)clearTimeout(this.toastTimer);
        this.toastTimer=setTimeout(()=>{this.toastMessage="";},2600);
      }
    };
  };
})();