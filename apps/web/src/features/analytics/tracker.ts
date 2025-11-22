// Analytics event tracking for the advent calendar application
// This provides a centralized way to track user interactions

export type AnalyticsEvent =
  | 'calendar_open'
  | 'calendar_share'
  | 'calendar_publish'
  | 'calendar_unpublish'
  | 'day_open'
  | 'surprise_open'
  | 'chat_message_sent'
  | 'chat_modal_open'
  | 'parent_portal_visit'
  | 'wizard_step_complete'
  | 'theme_selected'
  | 'photo_uploaded'
  | 'video_added';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  calendar_id?: string;
  child_id?: string;
  day_number?: number;
  theme?: string;
  persona?: string;
  timestamp?: string;
  user_agent?: string;
  session_id?: string;
}

class AnalyticsTracker {
  private isEnabled: boolean = true;
  private sessionId: string;

  constructor() {
    // Generate a session ID for this browser session
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enable or disable analytics tracking
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Track a custom event
  async track(event: AnalyticsEvent, data?: Partial<AnalyticsEventData>): Promise<void> {
    if (!this.isEnabled) return;

    const eventData: AnalyticsEventData = {
      event,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      session_id: this.sessionId,
      ...data,
    };

    try {
      // Send to backend analytics endpoint
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        // Analytics tracking failed silently
      }
       } catch {
          // Error handled silently - analytics failures shouldn't break the app
          // Don't throw - analytics failures shouldn't break the app
    }
  }

  // Specific tracking methods for common events
  async trackCalendarOpen(calendarId: string, childId?: string): Promise<void> {
    await this.track('calendar_open', { calendar_id: calendarId, child_id: childId });
  }

  async trackCalendarShare(calendarId: string): Promise<void> {
    await this.track('calendar_share', { calendar_id: calendarId });
  }

  async trackCalendarPublish(calendarId: string, theme?: string): Promise<void> {
    await this.track('calendar_publish', { calendar_id: calendarId, theme });
  }

  async trackCalendarUnpublish(calendarId: string): Promise<void> {
    await this.track('calendar_unpublish', { calendar_id: calendarId });
  }

  async trackDayOpen(calendarId: string, dayNumber: number): Promise<void> {
    await this.track('day_open', { calendar_id: calendarId, day_number: dayNumber });
  }

  async trackSurpriseOpen(calendarId: string): Promise<void> {
    await this.track('surprise_open', { calendar_id: calendarId });
  }

  async trackChatMessageSent(calendarId: string, persona?: string): Promise<void> {
    await this.track('chat_message_sent', { calendar_id: calendarId, persona });
  }

  async trackChatModalOpen(calendarId: string): Promise<void> {
    await this.track('chat_modal_open', { calendar_id: calendarId });
  }

  async trackParentPortalVisit(): Promise<void> {
    await this.track('parent_portal_visit');
  }

  async trackWizardStepComplete(step: string, calendarId?: string): Promise<void> {
    await this.track('wizard_step_complete', { calendar_id: calendarId });
  }

  async trackThemeSelected(theme: string, calendarId?: string): Promise<void> {
    await this.track('theme_selected', { theme, calendar_id: calendarId });
  }

  async trackPhotoUploaded(calendarId?: string, dayNumber?: number): Promise<void> {
    await this.track('photo_uploaded', { calendar_id: calendarId, day_number: dayNumber });
  }

  async trackVideoAdded(calendarId?: string): Promise<void> {
    await this.track('video_added', { calendar_id: calendarId });
  }
}

// Export a singleton instance
export const analyticsTracker = new AnalyticsTracker();

// Export the class for testing or custom instances
export { AnalyticsTracker };