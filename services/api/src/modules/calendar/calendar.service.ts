import {
  CalendarRepository,
  CreateCalendarData,
  UpdateCalendarData,
  CreateCalendarDayData,
  UpdateCalendarDayData
} from './calendar.repository';

export class CalendarService {
  constructor(private calendarRepository: CalendarRepository) {}

  async getCalendarById(calendarId: string) {
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) {
      throw new Error('Calendar not found');
    }
    return calendar;
  }

  async getCalendarByShareUuid(shareUuid: string) {
    const calendar = await this.calendarRepository.findByShareUuid(shareUuid);
    if (!calendar) {
      throw new Error('Calendar not found or not published');
    }
    return calendar;
  }

  async getCalendarsByAccountId(accountId: string) {
    return await this.calendarRepository.findByAccountId(accountId);
  }

  async createCalendar(calendarData: CreateCalendarData) {
    // Check if calendar already exists for this child/year
    const existingCalendar = await this.calendarRepository.findByChildAndYear(
      calendarData.child_id,
      calendarData.year
    );

    if (existingCalendar) {
      throw new Error('Calendar already exists for this child and year');
    }

    const calendar = await this.calendarRepository.create(calendarData);

    // Create empty days for the calendar
    await this.calendarRepository.createEmptyDaysForCalendar(calendar.calendar_id);

    return calendar;
  }

  async updateCalendar(calendarId: string, updateData: UpdateCalendarData) {
    return await this.calendarRepository.update(calendarId, updateData);
  }

  async publishCalendar(calendarId: string) {
    return await this.calendarRepository.update(calendarId, { is_published: true });
  }

  async unpublishCalendar(calendarId: string) {
    return await this.calendarRepository.update(calendarId, { is_published: false });
  }

  async deleteCalendar(calendarId: string) {
    // Verify calendar exists
    const calendar = await this.calendarRepository.findById(calendarId);
    if (!calendar) {
      throw new Error('Calendar not found');
    }

    await this.calendarRepository.delete(calendarId);
  }

  // Calendar Day methods
  async getCalendarDays(calendarId: string) {
    // Verify calendar exists and is accessible
    await this.getCalendarById(calendarId);

    return await this.calendarRepository.findDaysByCalendarId(calendarId);
  }

  async getCalendarDay(calendarDayId: string) {
    const day = await this.calendarRepository.findDayById(calendarDayId);
    if (!day) {
      throw new Error('Calendar day not found');
    }
    return day;
  }

  async updateCalendarDay(calendarDayId: string, updateData: UpdateCalendarDayData) {
    // Verify the day exists
    const existingDay = await this.calendarRepository.findDayById(calendarDayId);
    if (!existingDay) {
      throw new Error('Calendar day not found');
    }

    return await this.calendarRepository.updateDay(calendarDayId, updateData);
  }

  async updateCalendarDays(calendarId: string, dayUpdates: Array<{
    day_number: number;
    photo_url?: string;
    text_content?: string;
  }>) {
    // Verify calendar exists
    await this.getCalendarById(calendarId);

    // Get existing days
    const existingDays = await this.calendarRepository.findDaysByCalendarId(calendarId);
    const existingDaysMap = new Map(
      existingDays.map(day => [day.day_number, day])
    );

    // Update each day
    const results: any[] = [];
    for (const update of dayUpdates) {
      const existingDay = existingDaysMap.get(update.day_number);
      if (!existingDay) {
        throw new Error(`Day ${update.day_number} not found in calendar`);
      }

      const result = await this.calendarRepository.updateDay(existingDay.calendar_day_id, {
        photo_url: update.photo_url,
        text_content: update.text_content,
      });
      results.push(result);
    }

    return results;
  }
}