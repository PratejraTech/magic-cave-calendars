import { AnalyticsRepository, CreateAnalyticsEventData } from './analytics.repository';

export class AnalyticsService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async trackEvent(eventData: CreateAnalyticsEventData) {
    return await this.analyticsRepository.createEvent(eventData);
  }

  async trackCalendarOpen(accountId: string, calendarId: string, childId?: string) {
    return await this.trackEvent({
      account_id: accountId,
      calendar_id: calendarId,
      child_id: childId,
      event_type: 'calendar_open',
    });
  }

  async trackDayOpen(accountId: string, calendarId: string, dayNumber: number, childId?: string) {
    return await this.trackEvent({
      account_id: accountId,
      calendar_id: calendarId,
      child_id: childId,
      event_type: 'day_open',
      event_payload: { day_number: dayNumber },
    });
  }

  async trackSurpriseOpen(accountId: string, calendarId: string, childId?: string) {
    return await this.trackEvent({
      account_id: accountId,
      calendar_id: calendarId,
      child_id: childId,
      event_type: 'surprise_open',
    });
  }

  async trackChatMessageSent(accountId: string, childId: string, sessionId: string) {
    return await this.trackEvent({
      account_id: accountId,
      child_id: childId,
      event_type: 'chat_message_sent',
      event_payload: { session_id: sessionId },
    });
  }

  async trackChatModalOpen(accountId: string, childId: string, sessionId?: string) {
    return await this.trackEvent({
      account_id: accountId,
      child_id: childId,
      event_type: 'chat_modal_open',
      event_payload: { session_id: sessionId },
    });
  }

  async getAnalyticsSummary(accountId: string) {
    const events = await this.analyticsRepository.getEventsByAccountId(accountId, 10000);

    const summary = {
      total_events: events.length,
      calendar_opens: events.filter(e => e.event_type === 'calendar_open').length,
      day_opens: events.filter(e => e.event_type === 'day_open').length,
      surprise_opens: events.filter(e => e.event_type === 'surprise_open').length,
      chat_messages: events.filter(e => e.event_type === 'chat_message_sent').length,
      chat_modal_opens: events.filter(e => e.event_type === 'chat_modal_open').length,
      events_by_date: {} as Record<string, number>,
    };

    // Group events by date
    events.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      summary.events_by_date[date] = (summary.events_by_date[date] || 0) + 1;
    });

    return summary;
  }

  async getCalendarAnalytics(calendarId: string) {
    const [allEvents, dayOpens, surpriseOpens] = await Promise.all([
      this.analyticsRepository.getCalendarOpenEvents(calendarId),
      this.analyticsRepository.getDayOpenEvents(calendarId),
      this.analyticsRepository.getSurpriseOpenEvents(calendarId),
    ]);

    return {
      calendar_opens: allEvents.length,
      day_opens: dayOpens.length,
      surprise_opens: surpriseOpens.length,
      completion_rate: dayOpens.length / 24, // Assuming 24 days
    };
  }
}