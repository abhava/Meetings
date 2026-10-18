(function () {
  const mkAgenda = (id, title, category, notes = "", decision = "", expanded = false) => ({ id, title, category, notes, decision, expanded });
  const today = "2026-10-18";
  window.meetingsApp = function () {
    return {
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
      meetings: [
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
      init() {
        this.sortMeetings();
        this.selectedMeeting = null;
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
        }
      },
      scrollCarousel(direction) {
        const el = document.getElementById("meetingCarousel");
        if (el) el.scrollBy({ left: direction * Math.max(270, el.clientWidth * .72), behavior: "smooth" });
      },
      openCreate() {
        this.editingMeetingId = null;
        this.meetingForm = { title: "", date: "2026-10-30", time: "18:30", venue: "Society clubhouse", status: "Scheduled", attendees: "Alex Shah, Maya Patel, Ravi Desai", description: "" };
        this.showMeetingModal = true;
      },
      editMeeting(id) {
        const m = this.meetings.find(x=>x.id===id);
        if (!m) return;
        this.editingMeetingId=id;
        this.meetingForm={title:m.title,date:m.date,time:this.toTimeInput(m.time),venue:m.venue,status:m.status,attendees:m.attendees.join(", "),description:m.description||""};
        this.showMeetingModal=true;
      },
      toTimeInput(time) {
        const match = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return "18:30";
        let h=Number(match[1])%12; if(match[3].toUpperCase()==="PM") h+=12;
        return String(h).padStart(2,"0")+":"+match[2];
      },
      toDisplayTime(time) {
        if (!time) return "";
        const [hh,mm]=time.split(":").map(Number); const suffix=hh>=12?"PM":"AM";
        return (hh%12||12)+":"+String(mm).padStart(2,"0")+" "+suffix;
      },
      saveMeeting() {
        const f=this.meetingForm;
        if (!f.title.trim() || !f.date || !f.time || !f.venue.trim()) { this.toast("Please complete the required fields"); return; }
        const common={title:f.title.trim(),date:f.date,time:this.toDisplayTime(f.time),venue:f.venue.trim(),status:f.status,attendees:f.attendees.split(",").map(x=>x.trim()).filter(Boolean),description:f.description.trim(),updated:"Oct 18, 2026"};
        if (this.editingMeetingId) {
          const m=this.meetings.find(x=>x.id===this.editingMeetingId);
          if (m) Object.assign(m,common);
          this.toast("Meeting details updated");
        } else {
          const id="mtg-"+String(Date.now()).slice(-6);
          const m={id,...common,createdBy:"Alex Shah",agenda:[]};
          this.meetings.push(m);
          this.createReminders(m);
          this.toast("Meeting scheduled in this demo");
          this.sortMeetings();
        }
        this.showMeetingModal=false;
        if(this.selectedMeeting) this.selectedMeeting=this.meetings.find(m=>m.id===this.selectedMeeting.id)||null;
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
      completeMeeting(id) {
        const m=this.meetings.find(x=>x.id===id);if(!m)return;
        m.status="Completed";m.updated="Oct 18, 2026";
        this.toast("Meeting marked completed. Open actions remain open.");
      },
      setMeetingStatus(id,status) {
        const m=this.meetings.find(x=>x.id===id);if(!m)return;
        if(status==="Cancelled"){this.cancelMeeting(id);return;}
        m.status=status;if(status==="Scheduled")m.cancelReason="";
        m.updated="Oct 18, 2026";this.toast("Meeting status updated");
      },
      cancelMeeting(id) {
        this.cancelTargetId=id;
        const m=this.meetings.find(x=>x.id===id);
        this.cancelReason=m?.cancelReason||"";
        this.showCancelModal=true;
      },
      confirmCancel() {
        const m=this.meetings.find(x=>x.id===this.cancelTargetId);
        if(m){m.status="Cancelled";m.cancelReason=this.cancelReason.trim()||"Cancelled by committee.";m.updated="Oct 18, 2026";this.reminders.filter(r=>r.meetingId===m.id&&!r.sent).forEach(r=>r.cancelled=true);this.toast("Meeting cancelled; record retained.");}
        this.showCancelModal=false;
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