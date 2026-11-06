/* Our Meetings: persistent, per-member reminders and notification inbox. */
(function () {
  const baseFactory = window.meetingsApp;
  if (typeof baseFactory !== 'function') return;

  const defaultPreferences = () => ({
    email_enabled: false,
    meeting_24h: true,
    meeting_1h: true,
    meeting_followup: false,
    action_day_before: true,
    action_due_day: true
  });

  const EVENT_LABELS = {
    meeting_24h: '24 hours before',
    meeting_1h: '1 hour before',
    meeting_followup: 'Meeting minutes follow-up',
    action_day_before: 'Action due tomorrow',
    action_due_day: 'Action due today'
  };

  window.meetingsApp = function () {
    const state = baseFactory();
    state.reminders = [];
    state.notificationPreferences = defaultPreferences();
    state.emailConsent = null;
    state.remindersLoading = false;
    state.remindersError = '';
    state.preferencesSaveBusy = false;
    state.reminderFilter = 'All';
    state._reminderLoadRequest = 0;

    Object.defineProperty(state, 'unreadReminderCount', {
      enumerable: true,
      get() { return this.reminders.filter(item => !item.readAt).length; }
    });

    Object.defineProperty(state, 'scheduledReminderCount', {
      enumerable: true,
      get() { return this.buildScheduledReminders().length; }
    });

    Object.defineProperty(state, 'filteredReminders', {
      enumerable: true,
      get() {
        const alreadyCreated = new Set(this.reminders.map(item => item.eventType + ':' + item.eventId + ':' + item.scheduledFor));
        const planned = this.buildScheduledReminders().filter(item => !alreadyCreated.has(item.eventType + ':' + item.eventId + ':' + item.scheduledFor));
        let rows = [...planned, ...this.reminders];
        if (this.reminderFilter === 'Upcoming') rows = rows.filter(item => item.planned);
        else if (this.reminderFilter === 'Unread') rows = rows.filter(item => item.persisted && !item.readAt);
        else if (this.reminderFilter === 'History') rows = rows.filter(item => item.persisted);
        return rows.sort((a, b) => {
          if (a.planned !== b.planned) return a.planned ? -1 : 1;
          if (a.planned) return a.scheduledFor.localeCompare(b.scheduledFor);
          return b.scheduledFor.localeCompare(a.scheduledFor);
        });
      }
    });

    Object.defineProperty(state, 'homeReminderPreview', {
      enumerable: true,
      get() {
        const planned = this.buildScheduledReminders()
          .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
        const plannedKeys = new Set(planned.map(item => item.eventType + ':' + item.eventId + ':' + item.scheduledFor));
        const history = this.reminders
          .filter(item => !plannedKeys.has(item.eventType + ':' + item.eventId + ':' + item.scheduledFor))
          .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));
        return [...planned, ...history].slice(0, 3);
      }
    });

    Object.defineProperty(state, 'selectedMeetingReminders', {
      enumerable: true,
      get() {
        const eventRows = [...this.buildScheduledReminders(), ...this.reminders];
        return eventRows.filter(item => String(item.eventType || '').startsWith('meeting_') &&
          item.eventId === this.selectedMeeting?.id)
          .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
      }
    });

    state.loadReminderData = async function () {
      const client = window.supabaseClient;
      const orgId = this.currentOrganization?.id;
      const userId = this.authUser?.id;
      if (!client || !orgId || !userId) return;
      const requestId = ++this._reminderLoadRequest;
      this.remindersLoading = true;
      this.remindersError = '';
      try {
        const membershipId = this.currentMembership?.id;
        if (!membershipId) return;
        const [prefResult, notificationResult, consentResult] = await Promise.all([
          client.from('member_reminder_preferences')
            .select('email_enabled, meeting_24h, meeting_1h, meeting_followup, action_day_before, action_due_day')
            .eq('organization_id', orgId).eq('user_id', userId).maybeSingle(),
          client.from('reminder_notifications')
            .select('id, organization_id, user_id, event_type, event_id, title, body, scheduled_for, email_status, email_sent_at, read_at, created_at')
            .eq('organization_id', orgId).eq('user_id', userId)
            .order('scheduled_for', { ascending: false }).limit(100),
          client.from('notification_preferences')
            .select('id, organization_id, membership_id, channel, enabled, consent_status, consent_source, consent_text_version, consented_at, revoked_at')
            .eq('organization_id', orgId).eq('membership_id', membershipId).eq('channel', 'email').maybeSingle()
        ]);
        if (requestId !== this._reminderLoadRequest || this.currentOrganization?.id !== orgId || this.authUser?.id !== userId) return;
        if (prefResult.error) throw new Error(prefResult.error.message);
        if (notificationResult.error) throw new Error(notificationResult.error.message);
        if (consentResult.error) throw new Error(consentResult.error.message);

        this.emailConsent = consentResult.data || null;
        this.notificationPreferences = Object.assign(defaultPreferences(), prefResult.data || {});
        const validEmailConsent = !!this.emailConsent &&
          this.emailConsent.enabled === true &&
          String(this.emailConsent.consent_status || '').toLowerCase() === 'opted_in' &&
          !!this.emailConsent.consented_at &&
          !this.emailConsent.revoked_at;
        this.notificationPreferences.email_enabled = this.notificationPreferences.email_enabled === true && validEmailConsent;
        const timezone = this.currentOrganization.timezone || 'Asia/Kolkata';
        this.reminders = (notificationResult.data || []).map(row => ({
          id: row.id,
          organizationId: row.organization_id,
          userId: row.user_id,
          eventType: row.event_type,
          eventId: row.event_id,
          title: row.title,
          body: row.body || '',
          scheduledFor: row.scheduled_for,
          date: this.dateForTimezone(row.scheduled_for, timezone),
          time: this.timeForTimezone(row.scheduled_for, timezone),
          meetingTime: '',
          offset: EVENT_LABELS[row.event_type] || 'Reminder',
          channel: row.email_status === 'sent' ? 'In-app + email' :
            (row.email_status === 'failed' ? 'In-app · email retry pending' :
              (row.email_status === 'pending' ? 'In-app · email queued' : 'In-app only')),
          emailStatus: row.email_status,
          emailSentAt: row.email_sent_at,
          readAt: row.read_at,
          createdAt: row.created_at,
          persisted: true,
          planned: false,
          sent: true
        }));
      } catch (error) {
        if (requestId !== this._reminderLoadRequest) return;
        console.error('Could not load reminder data.', error);
        this.remindersError = 'Reminders are temporarily unavailable. Please try again or contact your committee administrator.';
      } finally {
        if (requestId === this._reminderLoadRequest) this.remindersLoading = false;
      }
    };

    state.buildScheduledReminders = function () {
      const orgId = this.currentOrganization?.id;
      const userId = this.authUser?.id;
      if (!orgId || !userId) return [];
      const prefs = Object.assign(defaultPreferences(), this.notificationPreferences || {});
      const now = Date.now();
      const maxTime = now + 30 * 86400000;
      const timezone = this.currentOrganization.timezone || 'Asia/Kolkata';
      const rows = [];
      const add = (type, eventId, title, body, when, offset, meetingTime) => {
        const date = new Date(when);
        const stamp = date.getTime();
        if (!Number.isFinite(stamp) || stamp <= now || stamp > maxTime) return;
        rows.push({
          id: 'planned:' + type + ':' + eventId,
          organizationId: orgId,
          eventType: type,
          eventId,
          title,
          body,
          scheduledFor: date.toISOString(),
          date: this.dateForTimezone(date.toISOString(), timezone),
          time: this.timeForTimezone(date.toISOString(), timezone),
          meetingTime: meetingTime || '',
          offset: EVENT_LABELS[type] || 'Reminder',
          channel: prefs.email_enabled ? 'In-app + optional email' : 'In-app',
          emailStatus: prefs.email_enabled ? 'opt-in' : 'disabled',
          readAt: null,
          persisted: false,
          planned: true,
          sent: false
        });
      };

      for (const meeting of (this.meetings || [])) {
        if (meeting.status !== 'Scheduled' || !meeting.startsAt) continue;
        const start = new Date(meeting.startsAt);
        const mt = this.timeForTimezone(meeting.startsAt, meeting.timezone || timezone);
        if (prefs.meeting_24h) add('meeting_24h', meeting.id, 'Meeting tomorrow: ' + meeting.title,
          'The committee meeting is scheduled for ' + this.formatLong(this.dateForTimezone(meeting.startsAt, meeting.timezone || timezone)) + ' at ' + mt + '.',
          start.getTime() - 24 * 3600000, EVENT_LABELS.meeting_24h, mt);
        if (prefs.meeting_1h) add('meeting_1h', meeting.id, 'Meeting starts in about 1 hour: ' + meeting.title,
          'The committee meeting is scheduled for ' + this.formatLong(this.dateForTimezone(meeting.startsAt, meeting.timezone || timezone)) + ' at ' + mt + '.',
          start.getTime() - 3600000, EVENT_LABELS.meeting_1h, mt);
        if (prefs.meeting_followup) {
          const end = meeting.endsAt ? new Date(meeting.endsAt).getTime() : start.getTime() + 2 * 3600000;
          add('meeting_followup', meeting.id, 'Complete meeting minutes: ' + meeting.title,
            'Record the meeting summary, decisions, and follow-up actions.',
            end + 3600000, EVENT_LABELS.meeting_followup, mt);
        }
      }

      const assignedToCurrentUser = new Set((this.activeMembers || [])
        .filter(member => member.userId === userId).map(member => member.id));
      const addActionAt = (action, type, date, title) => {
        if (!date) return;
        let instant;
        try { instant = this.isoFromLocalDateTime(date, '09:00', timezone); } catch (_) { return; }
        add(type, action.id, title + ': ' + action.title,
          'Action item due ' + this.formatLong(action.due) + '. Assigned owner: ' + action.owner + '.',
          instant, EVENT_LABELS[type], '');
      };
      for (const action of (this.actions || [])) {
        if (!action.due || !assignedToCurrentUser.has(action.assigneeMembershipId) ||
            !['Open', 'In Progress'].includes(action.status)) continue;
        if (prefs.action_day_before) {
          const parts = action.due.split('-').map(Number);
          const dayBefore = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] - 1, 12));
          const previousDate = dayBefore.getUTCFullYear() + '-' + String(dayBefore.getUTCMonth() + 1).padStart(2, '0') + '-' + String(dayBefore.getUTCDate()).padStart(2, '0');
          addActionAt(action, 'action_day_before', previousDate, 'Action due tomorrow');
        }
        if (prefs.action_due_day) addActionAt(action, 'action_due_day', action.due, 'Action due today');
      }
      return rows;
    };

    state.saveNotificationPreferences = async function () {
      if (this.currentMembership?.role === 'viewer') {
        this.toast('Guest demo access is read-only. Reminder preferences cannot be changed.');
        return;
      }
      const client = window.supabaseClient;
      const orgId = this.currentOrganization?.id;
      const userId = this.authUser?.id;
      const membershipId = this.currentMembership?.id;
      if (!client || !orgId || !userId || !membershipId) {
        this.toast('Sign in to your committee workspace to save reminder preferences.');
        return;
      }
      if (this.preferencesSaveBusy) return;
      this.preferencesSaveBusy = true;
      const p = Object.assign(defaultPreferences(), this.notificationPreferences || {});
      const now = new Date().toISOString();
      try {
        // Record the user's explicit email choice first. Email delivery remains
        // fail-closed unless this record and the separate reminder toggle agree.
        const shouldRecordOptIn = p.email_enabled === true;
        const shouldRevoke = p.email_enabled !== true &&
          (this.emailConsent?.consent_status === 'opted_in' || this.emailConsent?.enabled === true);
        if (shouldRecordOptIn || shouldRevoke) {
          const consentPayload = {
            organization_id: orgId,
            membership_id: membershipId,
            channel: 'email',
            enabled: shouldRecordOptIn,
            consent_status: shouldRecordOptIn ? 'opted_in' : 'opted_out',
            consent_source: 'our_meetings_reminder_settings',
            consent_text_version: 'email-reminder-consent-v1',
            consented_at: shouldRecordOptIn
              ? (this.emailConsent?.consent_status === 'opted_in' && this.emailConsent?.enabled === true && !this.emailConsent?.revoked_at
                  ? this.emailConsent.consented_at
                  : now)
              : (this.emailConsent?.consented_at || null),
            revoked_at: shouldRecordOptIn ? null : now,
            updated_at: now
          };
          const { data, error } = await client.from('notification_preferences')
            .upsert(consentPayload, { onConflict: 'organization_id,membership_id,channel' })
            .select('id, organization_id, membership_id, channel, enabled, consent_status, consent_source, consent_text_version, consented_at, revoked_at')
            .maybeSingle();
          if (error) throw error;
          this.emailConsent = data || consentPayload;
        }

        const { error } = await client.from('member_reminder_preferences').upsert({
          organization_id: orgId,
          user_id: userId,
          email_enabled: p.email_enabled === true,
          meeting_24h: p.meeting_24h === true,
          meeting_1h: p.meeting_1h === true,
          meeting_followup: p.meeting_followup === true,
          action_day_before: p.action_day_before === true,
          action_due_day: p.action_due_day === true,
          updated_at: now
        }, { onConflict: 'organization_id,user_id' });
        if (error) throw error;

        this.notificationPreferences = p;
        this.toast(shouldRecordOptIn
          ? 'Reminder settings saved. Email consent is recorded for this committee.'
          : 'Reminder settings saved. Email reminders are off.');
      } catch (error) {
        this.toast('Could not save preferences: ' + (error?.message || 'Database error'));
        // Re-read persisted state so a failed partial save cannot leave a false
        // "enabled" indication in the interface.
        await this.loadReminderData();
      } finally {
        this.preferencesSaveBusy = false;
      }
    };

    state.markReminderRead = async function (id) {
      if (this.currentMembership?.role === 'viewer') return;
      const client = window.supabaseClient;
      const orgId = this.currentOrganization?.id;
      const userId = this.authUser?.id;
      if (!client || !orgId || !userId || !id) return;
      try {
        const { data, error } = await client.from('reminder_notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', id).eq('organization_id', orgId).eq('user_id', userId)
          .select('id').maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Notification was not updated.');
        const row = this.reminders.find(item => item.id === id);
        if (row) row.readAt = new Date().toISOString();
      } catch (error) {
        this.toast('Could not mark notification as read: ' + (error?.message || 'Database error'));
      }
    };

    state.openReminder = function (reminder) {
      if (!reminder) return;
      if (reminder.persisted && !reminder.readAt) this.markReminderRead(reminder.id);
      if (String(reminder.eventType || '').startsWith('meeting_')) {
        this.openMeeting(reminder.eventId);
      } else {
        this.go('actionItems');
        const action = this.actions.find(item => item.id === reminder.eventId);
        this.actionSearch = action?.title || reminder.title;
        this.actionFilter = 'All';
      }
    };

    const baseGo = state.go;
    state.go = function (page, filter) {
      const result = baseGo.call(this, page, filter);
      if (page === 'reminders') this.loadReminderData();
      return result;
    };

    state.verifyCurrentMembership = async function () {
      const client = window.supabaseClient;
      const membership = this.currentMembership;
      if (!client || !membership?.id || this.authState !== 'ready') return;
      try {
        const { data, error } = await client.from('organization_memberships')
          .select('id, status, role')
          .eq('id', membership.id)
          .maybeSingle();
        if (error) throw error;
        if (!data || data.status !== 'active') {
          this.resetAuthContext();
          this.meetings = [];
          this.actions = [];
          this.workItemLinks = [];
          this.authState = 'noMembership';
          this.guestAccessError = 'Your demo access has been revoked or suspended. Contact the workspace owner if you need access again.';
          return;
        }
        if (data.role !== membership.role) {
          this.currentMembership = { ...membership, role: data.role, status: data.status };
          this.memberships = this.memberships.map(item =>
            item.id === data.id ? { ...item, role: data.role, status: data.status } : item
          );
          if (data.role !== 'owner' && this.page === 'members') this.go('dashboard');
        }
      } catch (error) {
        console.warn('Could not refresh the current membership status:', error?.message || error);
      }
    };

    const baseInit = state.init;
    state.init = async function (...args) {
      const result = await baseInit.apply(this, args);
      const app = this;
      if (!app._reminderRefreshHandle && typeof window.setInterval === 'function') {
        app._reminderRefreshHandle = window.setInterval(async () => {
          if (app.authState === 'ready' && app.currentOrganization?.id &&
              (typeof document === 'undefined' || document.visibilityState !== 'hidden')) {
            await app.verifyCurrentMembership();
            if (app.authState === 'ready') await app.loadReminderData();
          }
        }, 5 * 60 * 1000);
      }
      return result;
    };

    const baseSwitchMembership = state.switchMembership;
    state.switchMembership = function (membershipId) {
      const next = this.memberships.find(item => item.id === membershipId);
      if (this.currentOrganization?.id !== next?.organization?.id) {
        this.reminders = [];
        this.notificationPreferences = defaultPreferences();
        this.emailConsent = null;
        this.remindersError = '';
        this._reminderLoadRequest++;
      }
      return baseSwitchMembership.call(this, membershipId);
    };

    const baseLoadMeetings = state.loadMeetingsFromDatabase;
    state.loadMeetingsFromDatabase = async function (...args) {
      await baseLoadMeetings.apply(this, args);
      if (this.currentOrganization?.id && this.meetingsLoaded) await this.loadReminderData();
    };

    const baseSignOut = state.signOut;
    state.signOut = async function (...args) {
      this.reminders = [];
      this.notificationPreferences = defaultPreferences();
      this.emailConsent = null;
      this._reminderLoadRequest++;
      return baseSignOut.apply(this, args);
    };

    return state;
  };
})();