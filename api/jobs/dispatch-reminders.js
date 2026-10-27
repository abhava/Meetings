import { config, email } from 'hatchable';

export const access = 'scheduler';
export const methods = ['POST'];

const SUPABASE_URL = 'https://xwgtjwpvmbyubmhnviks.supabase.co';
const APP_URL = 'https://our-meetings.hatchable.site';
const REMINDER_WINDOW_MS = 75 * 60 * 1000;
const MAX_EMAIL_CALLS_PER_RUN = 10;

function encodeQuery(query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  return params.toString();
}

async function supabaseRequest(key, path, options = {}) {
  const query = encodeQuery(options.query);
  const url = SUPABASE_URL + '/rest/v1/' + path + (query ? '?' + query : '');
  const headers = {
    apikey: key,
    Accept: 'application/json'
  };
  // Current Supabase sb_secret_ keys are not JWTs: send them in apikey only.
  // Legacy service_role JWTs still need the Authorization bearer header.
  if (/^eyJ/.test(key)) headers.Authorization = 'Bearer ' + key;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.prefer) headers.Prefer = options.prefer;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const raw = await response.text();
  let payload = null;
  if (raw) {
    try { payload = JSON.parse(raw); } catch (_) { payload = raw; }
  }
  if (!response.ok) {
    const detail = typeof payload === 'string' ? payload : (payload?.message || payload?.hint || '');
    throw new Error('Supabase request failed (' + response.status + ') on ' + path + (detail ? ': ' + String(detail).slice(0, 220) : ''));
  }
  return payload;
}

function partsInZone(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function localDateString(date, timezone) {
  const p = partsInZone(date, timezone);
  return p.year + '-' + p.month + '-' + p.day;
}

function addDays(dateString, number) {
  const parts = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + number, 12));
  return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
}

function localWallTimeToUtc(dateString, timeString, timezone) {
  const d = dateString.split('-').map(Number);
  const t = timeString.split(':').map(Number);
  const desired = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], 0);
  let candidate = desired;
  for (let i = 0; i < 4; i++) {
    const p = partsInZone(new Date(candidate), timezone);
    const actual = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
    candidate += desired - actual;
  }
  return new Date(candidate);
}

function isDueNow(when, now) {
  const value = when instanceof Date ? when.getTime() : new Date(when).getTime();
  return Number.isFinite(value) && value <= now.getTime() && value > now.getTime() - REMINDER_WINDOW_MS;
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
  });
}

function formatMeetingTime(instant, timezone) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone || 'Asia/Kolkata',
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  }).format(instant);
}

function defaultPreferences() {
  return {
    email_enabled: false,
    meeting_24h: true,
    meeting_1h: true,
    meeting_followup: false,
    action_day_before: true,
    action_due_day: true
  };
}

function preferenceEnabled(prefs, key) {
  if (Object.prototype.hasOwnProperty.call(prefs || {}, key)) return prefs[key] === true;
  return defaultPreferences()[key] === true;
}

// Fail closed: sending email requires an explicit, current email-consent record.
// The existing consent table is membership-scoped; reminder preferences alone
// must never be treated as legal/operational consent.
function hasExplicitEmailConsent(rows) {
  const consent = (rows || []).find(row => String(row.channel || '').toLowerCase() === 'email');
  return !!consent &&
    consent.enabled === true &&
    String(consent.consent_status || '').trim().toLowerCase() === 'opted_in' &&
    !!consent.consented_at &&
    !consent.revoked_at;
}

function makeMeetingEvent(meeting, eventType, offsetMs, label, body, now) {
  const startsAt = new Date(meeting.starts_at);
  const scheduledFor = new Date(startsAt.getTime() - offsetMs);
  if (startsAt.getTime() <= now.getTime() || !isDueNow(scheduledFor, now)) return null;
  return {
    organization_id: meeting.organization_id,
    event_type: eventType,
    event_id: meeting.id,
    title: label + ': ' + meeting.title,
    body: body,
    scheduled_for: scheduledFor.toISOString()
  };
}

function makeActionEvent(action, org, eventType, dueWhen, titlePrefix, now) {
  if (!isDueNow(dueWhen, now)) return null;
  return {
    organization_id: action.organization_id,
    event_type: eventType,
    event_id: action.id,
    title: titlePrefix + ': ' + action.title,
    body: 'Action item due ' + formatMeetingTime(dueWhen, org.timezone) + '. Assigned owner: follow up in Our Meetings.',
    scheduled_for: dueWhen.toISOString()
  };
}

async function listRows(key, table, query) {
  const rows = await supabaseRequest(key, table, { query: Object.assign({ select: '*' }, query || {}) });
  if (!Array.isArray(rows)) throw new Error('Expected rows from Supabase table ' + table);
  return rows;
}

async function updateNotification(key, id, patch) {
  await supabaseRequest(key, 'reminder_notifications', {
    method: 'PATCH',
    query: { id: 'eq.' + id },
    body: Object.assign({}, patch, { updated_at: new Date().toISOString() }),
    prefer: 'return=minimal'
  });
}

async function sendNotificationEmail(key, row) {
  const attempt = Number(row.email_attempts || 0) + 1;
  try {
    const delivery = await email.send({
      to: row.recipient_email,
      subject: 'Our Meetings reminder: ' + String(row.title || 'Committee reminder').slice(0, 180),
      text: String(row.body || '') + '\n\nOpen Our Meetings: ' + APP_URL,
      html: '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#26392c;line-height:1.6">' +
        '<p style="color:#5a805d;font-size:12px;font-weight:bold;letter-spacing:1px">OUR MEETINGS</p>' +
        '<h2 style="font-size:20px">' + escapeHtml(row.title) + '</h2>' +
        '<p>' + escapeHtml(row.body).replace(/\n/g, '<br>') + '</p>' +
        '<p><a href="' + APP_URL + '" style="color:#416d47">Open committee workspace</a></p>' +
        '<p style="font-size:12px;color:#78867b">You can change reminder email preferences in Our Meetings.</p></div>'
    });
    if (delivery && delivery.success === false) throw new Error('The email service did not confirm delivery.');
    await updateNotification(key, row.id, {
      email_status: 'sent',
      email_attempts: attempt,
      email_sent_at: new Date().toISOString(),
      email_error: null
    });
    return { called: true, sent: true };
  } catch (error) {
    await updateNotification(key, row.id, {
      email_status: 'failed',
      email_attempts: attempt,
      email_error: String(error?.message || 'Email delivery failed').slice(0, 300)
    });
    return { called: true, sent: false };
  }
}

async function processEmailRetries(key, now) {
  const rows = await listRows(key, 'reminder_notifications', {
    select: 'id,organization_id,user_id,title,body,recipient_email,email_status,email_attempts,scheduled_for',
    email_status: 'in.(pending,failed)',
    email_attempts: 'lt.3',
    created_at: 'gte.' + new Date(now.getTime() - 7 * 86400000).toISOString(),
    recipient_email: 'not.is.null',
    order: 'created_at.asc',
    limit: '10'
  });
  let called = 0, sent = 0;
  for (const row of rows) {
    if (called >= MAX_EMAIL_CALLS_PER_RUN) break;
    const [preferenceRows, profileRows, membershipRows] = await Promise.all([
      listRows(key, 'member_reminder_preferences', {
        select: 'email_enabled',
        organization_id: 'eq.' + row.organization_id,
        user_id: 'eq.' + row.user_id,
        limit: '1'
      }),
      listRows(key, 'profiles', {
        select: 'email',
        id: 'eq.' + row.user_id,
        limit: '1'
      }),
      listRows(key, 'organization_memberships', {
        select: 'id',
        organization_id: 'eq.' + row.organization_id,
        user_id: 'eq.' + row.user_id,
        status: 'eq.active',
        limit: '1'
      })
    ]);
    const currentlyOptedIn = preferenceRows[0]?.email_enabled === true;
    const activeMember = membershipRows.length > 0;
    let consentRows = [];
    if (activeMember) {
      consentRows = await listRows(key, 'notification_preferences', {
        select: 'channel,enabled,consent_status,consented_at,revoked_at',
        organization_id: 'eq.' + row.organization_id,
        membership_id: 'eq.' + membershipRows[0].id,
        channel: 'eq.email',
        limit: '1'
      });
    }
    const emailConsentValid = hasExplicitEmailConsent(consentRows);
    const currentEmail = String(profileRows[0]?.email || '').trim().toLowerCase();
    const targetEmail = String(row.recipient_email || '').trim().toLowerCase();
    if (!activeMember || !currentlyOptedIn || !emailConsentValid || !currentEmail || currentEmail !== targetEmail) {
      await updateNotification(key, row.id, { email_status: 'disabled', recipient_email: null, email_error: null });
      continue;
    }
    const result = await sendNotificationEmail(key, row);
    if (result.called) called++;
    if (result.sent) sent++;
  }
  return { called, sent };
}

async function insertAndDeliver(key, org, member, profile, prefs, consent, event, budget) {
  if (event.event_type === 'meeting_24h' && !preferenceEnabled(prefs, 'meeting_24h')) return { created: false, called: 0, sent: 0 };
  if (event.event_type === 'meeting_1h' && !preferenceEnabled(prefs, 'meeting_1h')) return { created: false, called: 0, sent: 0 };
  if (event.event_type === 'meeting_followup' && !preferenceEnabled(prefs, 'meeting_followup')) return { created: false, called: 0, sent: 0 };
  if (event.event_type === 'action_day_before' && !preferenceEnabled(prefs, 'action_day_before')) return { created: false, called: 0, sent: 0 };
  if (event.event_type === 'action_due_day' && !preferenceEnabled(prefs, 'action_due_day')) return { created: false, called: 0, sent: 0 };

  const emailEnabled = preferenceEnabled(prefs, 'email_enabled') && !!profile?.email && hasExplicitEmailConsent(consent ? [consent] : []);
  const dedupeKey = [event.organization_id, member.user_id, event.event_type, event.event_id, event.scheduled_for].join(':');
  const rowToInsert = {
    organization_id: event.organization_id,
    user_id: member.user_id,
    event_type: event.event_type,
    event_id: event.event_id,
    title: event.title,
    body: event.body,
    scheduled_for: event.scheduled_for,
    dedupe_key: dedupeKey,
    recipient_email: emailEnabled ? profile.email : null,
    email_status: emailEnabled ? 'pending' : 'disabled',
    email_attempts: 0
  };
  const inserted = await supabaseRequest(key, 'reminder_notifications', {
    method: 'POST',
    query: { on_conflict: 'dedupe_key', select: '*' },
    body: rowToInsert,
    prefer: 'resolution=ignore-duplicates,return=representation'
  });
  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  if (!row?.id) return { created: false, called: 0, sent: 0 };

  if (!emailEnabled || budget.calls >= MAX_EMAIL_CALLS_PER_RUN) {
    return { created: true, called: 0, sent: 0 };
  }

  // Re-check current consent, active membership and address immediately before sending.
  const [currentPreferences, currentProfiles, currentMemberships, currentConsentRows] = await Promise.all([
    listRows(key, 'member_reminder_preferences', {
      select: 'email_enabled',
      organization_id: 'eq.' + event.organization_id,
      user_id: 'eq.' + member.user_id,
      limit: '1'
    }),
    listRows(key, 'profiles', {
      select: 'email',
      id: 'eq.' + member.user_id,
      limit: '1'
    }),
    listRows(key, 'organization_memberships', {
      select: 'id',
      organization_id: 'eq.' + event.organization_id,
      user_id: 'eq.' + member.user_id,
      status: 'eq.active',
      limit: '1'
    }),
    listRows(key, 'notification_preferences', {
      select: 'channel,enabled,consent_status,consented_at,revoked_at',
      organization_id: 'eq.' + event.organization_id,
      membership_id: 'eq.' + member.id,
      channel: 'eq.email',
      limit: '1'
    })
  ]);
  const currentEmail = String(currentProfiles[0]?.email || '').trim().toLowerCase();
  const storedEmail = String(row.recipient_email || '').trim().toLowerCase();
  if (currentPreferences[0]?.email_enabled !== true ||
      !hasExplicitEmailConsent(currentConsentRows) ||
      !currentMemberships.length || !currentEmail || currentEmail !== storedEmail) {
    await updateNotification(key, row.id, {
      email_status: 'disabled',
      recipient_email: null,
      email_error: null
    });
    return { created: true, called: 0, sent: 0 };
  }

  const result = await sendNotificationEmail(key, row);
  if (result.called) budget.calls++;
  if (result.sent) budget.sent++;
  return { created: true, called: result.called ? 1 : 0, sent: result.sent ? 1 : 0 };
}

async function dispatch(key) {
  const now = new Date();
  const lower = new Date(now.getTime() - 5 * 3600000).toISOString();
  const upper = new Date(now.getTime() + 26 * 3600000).toISOString();
  const orgRows = await listRows(key, 'organizations', {
    select: 'id,name,timezone',
    limit: '1000'
  });
  const summary = { organizations_checked: 0, events_due: 0, notifications_created: 0, email_calls: 0, emails_sent: 0, email_retries: 0 };
  const retryResult = await processEmailRetries(key, now);
  summary.email_calls += retryResult.called;
  summary.emails_sent += retryResult.sent;
  summary.email_retries += retryResult.called;
  const budget = { calls: retryResult.called, sent: retryResult.sent };

  for (const orgRow of orgRows) {
    const org = { id: orgRow.id, name: orgRow.name || 'Committee workspace', timezone: orgRow.timezone || 'Asia/Kolkata' };
    const today = localDateString(now, org.timezone);
    const tomorrow = addDays(today, 1);
    const meetings = await listRows(key, 'meetings', {
      select: 'id,organization_id,title,starts_at,ends_at,timezone,venue,status',
      organization_id: 'eq.' + org.id,
      and: '(starts_at.gte.' + lower + ',starts_at.lte.' + upper + ')',
      status: 'in.(scheduled,completed)',
      order: 'starts_at.asc',
      limit: '500'
    });
    const actions = await listRows(key, 'action_items', {
      select: 'id,organization_id,title,description,assignee_membership_id,due_date,status',
      organization_id: 'eq.' + org.id,
      and: '(due_date.gte.' + today + ',due_date.lte.' + tomorrow + ')',
      status: 'in.(open,in_progress)',
      order: 'due_date.asc',
      limit: '500'
    });
    if (!meetings.length && !actions.length) continue;
    summary.organizations_checked++;

    const members = await listRows(key, 'organization_memberships', {
      select: 'id,organization_id,user_id,status',
      organization_id: 'eq.' + org.id,
      status: 'eq.active',
      user_id: 'not.is.null',
      order: 'created_at.asc',
      limit: '1000'
    });
    if (!members.length) continue;
    const userIds = [...new Set(members.map(member => member.user_id).filter(Boolean))];
    if (!userIds.length) continue;

    const memberIds = members.map(member => member.id);
    const [profiles, preferences, consentRecords] = await Promise.all([
      listRows(key, 'profiles', { select: 'id,full_name,email', id: 'in.(' + userIds.join(',') + ')', limit: '1000' }),
      listRows(key, 'member_reminder_preferences', {
        select: 'organization_id,user_id,email_enabled,meeting_24h,meeting_1h,meeting_followup,action_day_before,action_due_day',
        organization_id: 'eq.' + org.id,
        user_id: 'in.(' + userIds.join(',') + ')',
        limit: '1000'
      }),
      listRows(key, 'notification_preferences', {
        select: 'organization_id,membership_id,channel,enabled,consent_status,consent_source,consent_text_version,consented_at,revoked_at',
        organization_id: 'eq.' + org.id,
        membership_id: 'in.(' + memberIds.join(',') + ')',
        channel: 'eq.email',
        limit: '1000'
      })
    ]);
    const profileByUser = Object.fromEntries(profiles.map(profile => [profile.id, profile]));
    const prefsByUser = Object.fromEntries(preferences.map(pref => [pref.user_id, pref]));
    const consentByMembershipId = Object.fromEntries(consentRecords.map(consent => [consent.membership_id, consent]));
    const memberById = Object.fromEntries(members.map(member => [member.id, member]));
    const events = [];

    for (const meeting of meetings) {
      const start = new Date(meeting.starts_at);
      if (!Number.isFinite(start.getTime())) continue;
      const tz = meeting.timezone || org.timezone;
      const meetingWhen = formatMeetingTime(start, tz);
      const venue = meeting.venue ? ' Venue: ' + meeting.venue + '.' : '';
      if (String(meeting.status).toLowerCase() === 'scheduled') {
        const dayEvent = makeMeetingEvent(meeting, 'meeting_24h', 24 * 3600000, 'Meeting tomorrow', 'The committee meeting is scheduled for ' + meetingWhen + '.' + venue, now);
        const hourEvent = makeMeetingEvent(meeting, 'meeting_1h', 3600000, 'Meeting starts in about 1 hour', 'The committee meeting is scheduled for ' + meetingWhen + '.' + venue, now);
        if (dayEvent) events.push(dayEvent);
        if (hourEvent) events.push(hourEvent);
      }
      const end = meeting.ends_at ? new Date(meeting.ends_at) : new Date(start.getTime() + 2 * 3600000);
      const followupAt = new Date(end.getTime() + 3600000);
      if (isDueNow(followupAt, now) && start.getTime() < now.getTime() && String(meeting.status).toLowerCase() !== 'cancelled') {
        events.push({
          organization_id: meeting.organization_id,
          event_type: 'meeting_followup',
          event_id: meeting.id,
          title: 'Complete meeting minutes: ' + meeting.title,
          body: 'Please record the summary, decisions, and follow-up actions for the meeting held ' + meetingWhen + '.',
          scheduled_for: followupAt.toISOString()
        });
      }
    }

    for (const action of actions) {
      if (!action.due_date || !action.assignee_membership_id) continue;
      const assignee = memberById[action.assignee_membership_id];
      if (!assignee?.user_id) continue;
      const dayBefore = localWallTimeToUtc(addDays(action.due_date, -1), '09:00', org.timezone);
      const dueDay = localWallTimeToUtc(action.due_date, '09:00', org.timezone);
      const actionBody = 'Action item: ' + action.title + '. Due date: ' + action.due_date + '. Please update its status in Our Meetings.';
      const dayEvent = makeActionEvent(action, org, 'action_day_before', dayBefore, 'Action due tomorrow', now);
      const dueEvent = makeActionEvent(action, org, 'action_due_day', dueDay, 'Action due today', now);
      if (dayEvent) { dayEvent.assignee_user_id = assignee.user_id; events.push(dayEvent); }
      if (dueEvent) { dueEvent.assignee_user_id = assignee.user_id; events.push(dueEvent); }
    }

    summary.events_due += events.length;
    for (const event of events) {
      const targets = event.assignee_user_id
        ? members.filter(member => member.user_id === event.assignee_user_id)
        : members;
      for (const member of targets) {
        if (!member.user_id) continue;
        const profile = profileByUser[member.user_id] || {};
        const prefs = prefsByUser[member.user_id] || defaultPreferences();
        const consent = consentByMembershipId[member.id] || null;
        const result = await insertAndDeliver(key, org, member, profile, prefs, consent, event, budget);
        if (result.created) summary.notifications_created++;
        summary.email_calls = budget.calls;
        summary.emails_sent = budget.sent;
      }
    }
  }
  return summary;
}

export default async function (req, res) {
  try {
    const key = await config.get('SUPABASE_SECRET_KEY');
    if (!key || typeof key !== 'string' || key.length < 20) {
      // Keep the hourly job quiet until the owner finishes private secret setup.
      return res.json({
        ok: true,
        skipped: true,
        reason: 'Reminder delivery is paused until SUPABASE_SECRET_KEY is configured in Hatchable Setup.'
      });
    }
    const result = await dispatch(key);
    return res.json({ ok: true, ...result });
  } catch (error) {
    const message = String(error?.message || '');
    const setupRequired = /setup_required|SUPABASE_SECRET_KEY/i.test(message);
    if (setupRequired) {
      return res.json({
        ok: true,
        skipped: true,
        reason: 'Reminder delivery is paused until SUPABASE_SECRET_KEY is configured in Hatchable Setup.'
      });
    }
    return res.status(500).json({
      error: 'The reminder dispatcher could not complete. Check Hatchable function logs and the Supabase migration.'
    });
  }
}