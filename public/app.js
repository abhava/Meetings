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
      meetingsLoading: false, meetingsLoaded: false, meetingsError: "", meetingSaveBusy: false,
      page: "dashboard", pageTitle: "Dashboard", mobileNav: false,
      demoToday: today, selectedMeeting: null,
      meetingSearch: "", meetingFilter: "All", meetingYear: "All",
      actionSearch: "", actionFilter: "Open items", ownerFilter: "All",
      minutesSearch: "", minutesYear: "All", reminderFilter: "All",
      showMeetingModal: false, showAgendaModal: false, showActionModal: false, showCancelModal: false,
      editingMeetingId: null, editingAgendaId: null, editingActionId: null, cancelTargetId: null, cancelReason: "", carryActionId: "act-001", carryAgendaId: "",
      toastMessage: "", toastTimer: null,
      settings: { dayBefore: true, hourBefore: true, after: false },
      meetingForm: { title: "", date: "2026-10-30", time: "18:30", venue: "Society clubhouse", status: "Scheduled", attendees: "Alex Shah, Maya Patel, Ravi Desai", description: "" },
      agendaForm: { title: "", category: "Discussion" },
      actionForm: { title: "", owner: "", due: "2026-10-30", meetingId: "mtg-004", agendaId: "", status: "Open" },
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
      actions: [
        { id: "act-001", title: "Complete building-wise leakage survey", owner: "Vaibhav Joshi", due: "2026-10-20", status: "In Progress", meetingId: "mtg-005", meetingTitle: "September Committee Review", agendaId: "ag-014", agendaTitle: "Review water supply issues" },
        { id: "act-002", title: "Collect two housekeeping quotations", owner: "Neha Kulkarni", due: "2026-10-21", status: "Open", meetingId: "mtg-005", meetingTitle: "September Committee Review", agendaId: "ag-015", agendaTitle: "Review housekeeping service" },
        { id: "act-003", title: "Update parking policy draft", owner: "Maya Patel", due: "2026-10-25", status: "Open", meetingId: "mtg-005", meetingTitle: "September Committee Review", agendaId: "ag-016", agendaTitle: "Parking policy feedback" },
        { id: "act-004", title: "Prepare expense comparison sheet", owner: "Karan Mehta", due: "2026-10-29", status: "Open", meetingId: "mtg-006", meetingTitle: "Budget Planning Discussion", agendaId: "ag-017", agendaTitle: "Review major expense heads" },
        { id: "act-005", title: "Get indicative play area estimates", owner: "Ravi Desai", due: "2026-10-16", status: "Open", meetingId: "mtg-008", meetingTitle: "Common Area Project Check-in", agendaId: "ag-021", agendaTitle: "Review proposed common area work" },
        { id: "act-006", title: "Share clubhouse improvement options", owner: "Alex Shah", due: "2026-10-24", status: "Completed", meetingId: "mtg-008", meetingTitle: "Common Area Project Check-in", agendaId: "ag-022", agendaTitle: "Assign initial research tasks" },
        { id: "act-007", title: "Confirm meter replacement schedule", owner: "Umesh Patil", due: "2026-10-30", status: "In Progress", meetingId: "mtg-001", meetingTitle: "Monthly Committee Meeting", agendaId: "ag-002", agendaTitle: "Water supply and leakage update" }
      ],
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
          this.authError = "Supabase could not initialize. Refresh the page or check the project configuration.";
          return;
        }
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
          this.authError = "Enter your registered email address.";
          return;
        }
        this.loginBusy = true;
        this.authError = "";
        this.authMessage = "";
        try {
          const { error } = await window.supabaseClient.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: window.location.origin + "/",
              shouldCreateUser: false
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
          this.meetings = [];
          this.selectedMeeting = null;
          this.meetingsLoaded = false;
          this.meetingsError = "";
          this.loadMeetingsFromDatabase();
        }
      },
      get canManageMeetings() {
        return ["owner", "admin"].includes(this.currentMembership?.role);
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
              .select("agenda_item_id, discussion_notes, decision_summary, decision")
              .eq("organization_id", orgId)
          ]);
          const [meetingResult, attendeeResult, agendaResult, minutesResult] = results;
          if (meetingResult.error) throw new Error("Could not load meetings: " + meetingResult.error.message);
          if (attendeeResult.error) throw new Error("Could not load meeting attendees: " + attendeeResult.error.message);
          if (agendaResult.error) throw new Error("Could not load agenda items: " + agendaResult.error.message);
          if (minutesResult.error) throw new Error("Could not load agenda notes: " + minutesResult.error.message);

          const attendeesByMeeting = {};
          (attendeeResult.data || []).forEach(row => {
            if (!attendeesByMeeting[row.meeting_id]) attendeesByMeeting[row.meeting_id] = [];
            attendeesByMeeting[row.meeting_id].push(row.attendee_name || row.attendee_email || "Committee member");
          });
          const minutesByAgenda = Object.fromEntries((minutesResult.data || []).map(row => [row.agenda_item_id, row]));
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
              expanded: false
            });
          });
          this.meetings = (meetingResult.data || []).map(row => ({
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
            createdBy: row.created_by === this.authUser?.id
              ? (this.profile?.full_name || this.authUser?.email || "You")
              : "Committee member",
            updated: row.updated_at
              ? new Date(row.updated_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
              : "—",
            attendees: attendeesByMeeting[row.id] || [],
            agenda: agendaByMeeting[row.id] || []
          }));
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
      async createOrganization() {
        if (!this.authSession?.user || this.organizationBusy) return;
        const name = String(this.organizationName || "").trim();
        const slug = this.slugify(this.organizationSlug || name);
        if (!name || !slug) {
          this.authError = "Enter a committee name and a valid workspace slug.";
          return;
        }
        this.organizationBusy = true;
        this.authError = "";
        try {
          const { data, error } = await window.supabaseClient.rpc("create_organization", {
            p_name: name,
            p_slug: slug,
            p_timezone: "Asia/Kolkata"
          });
          if (error) throw error;
          if (!data) throw new Error("The workspace function did not return an organization ID.");
          await this.loadUserContext(this.authSession, true);
          if (this.authState === "ready") this.toast("Workspace created successfully.");
        } catch (err) {
          this.authError = err?.message || "Could not create the workspace.";
        } finally {
          this.organizationBusy = false;
        }
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
      get openCount() { return this.actions.filter(a => a.status !== "Completed").length; },
      get overdueCount() { return this.actions.filter(a => a.status !== "Completed" && a.due < this.demoToday).length; },
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
          const statusOk = this.actionFilter === "All" || (this.actionFilter === "Open items" ? a.status !== "Completed" : a.status === this.actionFilter);
          return statusOk && (this.ownerFilter === "All" || a.owner === this.ownerFilter) && (!q || [a.title,a.owner,a.meetingTitle,a.agendaTitle,a.status].join(" ").toLowerCase().includes(q));
        }).sort((a,b) => {
          if (a.status === "Completed" && b.status !== "Completed") return 1;
          if (a.status !== "Completed" && b.status === "Completed") return -1;
          return a.due.localeCompare(b.due);
        });
      },
      get minutesMeetings() {
        const q = this.minutesSearch.toLowerCase().trim();
        return this.meetings.filter(m => (m.status === "Completed" || m.agenda.some(a => a.notes || a.decision)) && (this.minutesYear === "All" || m.date.startsWith(this.minutesYear)) && (!q || [m.title,m.venue,...m.agenda.map(a=>a.title+" "+a.notes+" "+a.decision)].join(" ").toLowerCase().includes(q))).sort((a,b) => b.date.localeCompare(a.date));
      },
      get filteredReminders() {
        return this.reminders.filter(r => !r.cancelled && (this.reminderFilter === "All" || (this.reminderFilter === "Scheduled" ? !r.sent : r.sent))).sort((a,b) => a.date.localeCompare(b.date));
      },
      go(page, filter) {
        this.page = page; this.mobileNav = false;
        const titles = { dashboard: "Dashboard", meetings: "Meeting schedule", detail: "Meeting details", actionItems: "Open action items", minutes: "Meeting minutes", reminders: "Reminders" };
        this.pageTitle = titles[page] || "Dashboard";
        if (filter) this.meetingFilter = filter;
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openMeeting(id) {
        this.selectedMeeting = this.meetings.find(m => m.id === id) || null;
        if (this.selectedMeeting) {
          this.selectedMeeting.agenda.forEach(a => { if (typeof a.expanded !== "boolean") a.expanded = false; });
          this.go("detail");
          this.pageTitle = "Meeting details";
        } else {
          this.toast("This item belongs to the sample action-item data. Action-item persistence will be connected next.");
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
            attendeeWarning = " The meeting saved, but attendees could not be saved: " + (attendeeError.message || "permission or database error");
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
          this.toast((status === "scheduled" && !attendeeWarning ? "Meeting saved to PostgreSQL." : "Meeting saved.") + attendeeWarning);
        } catch (err) {
          this.toast("Could not save meeting: " + (err?.message || "Unknown database error"));
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
        if(!this.selectedMeeting || this.selectedMeeting.status!=="Scheduled"){this.toast("Only scheduled meetings can be edited");return;}
        this.editingAgendaId=null;this.agendaForm={title:"",category:"Discussion"};this.showAgendaModal=true;
      },
      editAgenda(id) {
        const a=this.selectedMeeting?.agenda.find(x=>x.id===id);if(!a)return;
        this.editingAgendaId=id;this.agendaForm={title:a.title,category:a.category};this.showAgendaModal=true;
      },
      saveAgendaItem() {
        const title=this.agendaForm.title.trim();if(!title)return;
        if(this.editingAgendaId){const a=this.selectedMeeting.agenda.find(x=>x.id===this.editingAgendaId);if(a){a.title=title;a.category=this.agendaForm.category;}}
        else this.selectedMeeting.agenda.push(mkAgenda("ag-"+Date.now(),title,this.agendaForm.category,"","",true));
        this.showAgendaModal=false;this.toast(this.editingAgendaId?"Agenda item updated":"Agenda item added");
      },
      moveAgenda(id, direction) {
        if(!this.selectedMeeting)return;
        const arr=this.selectedMeeting.agenda;const i=arr.findIndex(a=>a.id===id);const j=i+direction;
        if(i<0||j<0||j>=arr.length)return;
        [arr[i],arr[j]]=[arr[j],arr[i]];this.selectedMeeting.agenda=arr.slice();this.toast("Agenda order updated");
      },
      removeAgenda(id) {
        if(!this.selectedMeeting)return;
        if(this.actions.some(a=>a.agendaId===id)){this.toast("This agenda item has linked actions. Keep it for the record.");return;}
        const item=this.selectedMeeting.agenda.find(a=>a.id===id);if(!item)return;
        if(!confirm("Remove agenda item “"+item.title+"”?"))return;
        this.selectedMeeting.agenda=this.selectedMeeting.agenda.filter(a=>a.id!==id);this.toast("Agenda item removed");
      },
      saveAgendaNote(id) {
        const agenda=this.selectedMeeting?.agenda.find(a=>a.id===id);
        if(agenda){this.selectedMeeting.updated="Oct 18, 2026";this.toast("Agenda notes saved for this demo");}
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
      completeAction(id) { this.toggleAction(id); },
      toggleAction(id) {
        const a=this.actions.find(x=>x.id===id);if(!a)return;
        a.status=a.status==="Completed"?"Open":"Completed";
        this.toast(a.status==="Completed"?"Action item completed":"Action item reopened");
      },
      openActionCreate() {
        this.editingActionId=null;
        const next=this.meetings.filter(m=>m.status==="Scheduled").sort((a,b)=>a.date.localeCompare(b.date))[0];
        this.actionForm={title:"",owner:"",due:"2026-10-30",meetingId:next?.id||this.meetings[0]?.id||"",agendaId:"",status:"Open"};
        this.showActionModal=true;
      },
      unlinkAction(id) {
        const a=this.actions.find(x=>x.id===id);if(!a)return;
        a.linkedMeetingId="";a.linkedMeetingTitle="";a.linkedAgendaId="";a.linkedAgendaTitle="";
        this.toast("Action removed from this meeting; original record preserved");
      },
      editAction(id) {
        const a=this.actions.find(x=>x.id===id);if(!a)return;
        this.editingActionId=id;this.actionForm={title:a.title,owner:a.owner,due:a.due,meetingId:a.meetingId,agendaId:a.agendaId||"",status:a.status};
        this.showActionModal=true;
      },
      saveAction() {
        const f=this.actionForm;const m=this.meetings.find(x=>x.id===f.meetingId);
        if(!m||!f.title.trim()||!f.owner.trim()||!f.due){this.toast("Please complete the required fields");return;}
        const agenda=m.agenda.find(a=>a.id===f.agendaId);
        const values={title:f.title.trim(),owner:f.owner.trim(),due:f.due,meetingId:m.id,meetingTitle:m.title,agendaId:f.agendaId||"",agendaTitle:agenda?.title||"General follow-up",status:f.status||"Open"};
        if(this.editingActionId){const a=this.actions.find(x=>x.id===this.editingActionId);if(a)Object.assign(a,values);this.toast("Action item updated");}
        else {this.actions.push({id:"act-"+Date.now(),...values});this.toast("Action item added");}
        this.showActionModal=false;
      },
      carryActionToMeeting() {
        if(!this.selectedMeeting)return;
        const action=this.actions.find(a=>a.id===this.carryActionId);
        if(!action || action.status==="Completed"){this.toast("Choose an unresolved action item first");return;}
        action.linkedMeetingId=this.selectedMeeting.id;
        action.linkedMeetingTitle=this.selectedMeeting.title;
        action.linkedAgendaId=this.carryAgendaId||"";
        action.linkedAgendaTitle=this.selectedMeeting.agenda.find(a=>a.id===this.carryAgendaId)?.title||"General follow-up";
        const remaining=this.actions.filter(a=>a.status!=="Completed" && a.linkedMeetingId!==this.selectedMeeting.id);
        this.carryActionId=remaining[0]?.id||"";
        this.toast("Action linked to this meeting; original reference preserved");
      },
      simulateReminder(id) {
        const r=this.reminders.find(x=>x.id===id);if(!r)return;r.sent=true;this.toast("Demo reminder simulated — no message sent");
      },
      statusClass(status) { return "status-"+String(status).toLowerCase(); },
      actionStatusClass(status) { return "status-"+String(status).toLowerCase().replace(/\s+/g,"-"); },
      dueClass(due) { if(due<this.demoToday)return "due-overdue";if(due<= "2026-10-21")return "due-soon";return ""; },
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