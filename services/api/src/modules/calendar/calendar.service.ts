import {
  CalendarRepository,
  CreateCalendarData,
  UpdateCalendarData,
  CreateCalendarDayData,
  UpdateCalendarDayData,
  CalendarDay
} from './calendar.repository';
import { TemplatesService } from '../templates/templates.service';
import { createRestClient, GenerateContentRequest, GenerateContentResponse } from '../../lib/restClient';

export class CalendarService {
  constructor(private calendarRepository: CalendarRepository, private templatesService?: TemplatesService) {}

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

    // Validate template if provided
    if (calendarData.template_id && this.templatesService) {
      // Check if template exists and is valid for calendar product type
      const isValid = await this.templatesService.validateTemplateForProductType(calendarData.template_id, 'calendar');
      if (!isValid) {
        throw new Error('Invalid template for calendar product type');
      }

      // Validate custom data against template schema if provided
      if (calendarData.custom_data) {
        const validation = await this.templatesService.validateCustomData(calendarData.template_id, calendarData.custom_data);
        if (!validation.valid) {
          throw new Error(`Invalid custom data: ${validation.errors?.join(', ')}`);
        }
      }
    }

    const calendar = await this.calendarRepository.create({
      account_id: calendarData.account_id,
      child_id: calendarData.child_id,
      year: calendarData.year,
      template_id: calendarData.template_id,
      custom_data: calendarData.custom_data,
    });

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

  async getCalendarDay(dayId: string) {
    const day = await this.calendarRepository.findDayById(dayId);
    if (!day) {
      throw new Error('Calendar day not found');
    }
    return day;
  }

  async updateCalendarDay(dayId: string, updateData: UpdateCalendarDayData) {
    // Verify the day exists
    const existingDay = await this.calendarRepository.findDayById(dayId);
    if (!existingDay) {
      throw new Error('Calendar day not found');
    }

    return await this.calendarRepository.updateDay(dayId, updateData);
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
    const results: CalendarDay[] = [];
    for (const update of dayUpdates) {
      const existingDay = existingDaysMap.get(update.day_number);
      if (!existingDay) {
        throw new Error(`Day ${update.day_number} not found in calendar`);
      }

      const result = await this.calendarRepository.updateDay(existingDay.day_id, {
        photo_url: update.photo_url,
        text_content: update.text_content,
      });
      results.push(result);
    }

    return results;
  }

  async generateCalendarContent(calendarId: string, templateId: string, customData: Record<string, any>) {
    // Verify calendar exists and is accessible
    const calendar = await this.getCalendarById(calendarId);

    // Validate template if templates service is available
    if (this.templatesService) {
      const isValid = await this.templatesService.validateTemplateForProductType(templateId, 'calendar');
      if (!isValid) {
        throw new Error('Invalid template for calendar product type');
      }

      // Validate custom data against template schema
      const validation = await this.templatesService.validateCustomData(templateId, customData);
      if (!validation.valid) {
        throw new Error(`Invalid custom data: ${validation.errors?.join(', ')}`);
      }
    }

    // Call intelligence service to generate content
    const restClient = createRestClient();
    const request: GenerateContentRequest = {
      template_id: templateId,
      custom_data: customData,
      product_type: 'calendar',
      product_config: {
        child_name: 'Child', // TODO: Get from child service
        theme: 'default',    // TODO: Get from calendar/child data
      }
    };

    const response: GenerateContentResponse = await restClient.generateContent(request);

    // Update calendar days with generated content
    const dayUpdates = response.content.day_entries.map(entry => ({
      day_number: entry.day,
      text_content: entry.text,
      photo_url: entry.photo_url,
    }));

    await this.updateCalendarDays(calendarId, dayUpdates);

    return {
      calendar_id: calendarId,
      generated_days: dayUpdates.length,
      chat_persona_prompt: response.content.chat_persona_prompt,
      surprise_urls: response.content.surprise_urls,
    };
  }
}