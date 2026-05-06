import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import {
  CreateMeetEventInput,
  CreateMeetEventResult,
  MeetService,
} from '../common/interfaces/MeetEventInterfaces';

@Injectable()
export class GoogleCalendarService implements OnModuleInit, MeetService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private calendar: calendar_v3.Calendar | null = null;
  private calendarId = 'primary';

  onModuleInit() {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
    this.calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.warn(
        'Google Calendar credentials missing — Meet links will not be generated.',
      );
      return;
    }

    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    this.calendar = google.calendar({ version: 'v3', auth: oauth2 });
  }

  async createMeetEvent(
    input: CreateMeetEventInput,
  ): Promise<CreateMeetEventResult> {
    if (!this.calendar) {
      throw new Error('Google Calendar client is not configured.');
    }

    const response = await this.calendar.events.insert({
      calendarId: this.calendarId,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startISO },
        end: { dateTime: input.endISO },
        attendees: input.attendees.map((a) => ({
          email: a.email,
          displayName: a.displayName,
        })),
        conferenceData: {
          createRequest: {
            requestId: input.requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const data = response.data;
    const eventId = data.id;
    const meetLink = data.hangoutLink;
    const htmlLink = data.htmlLink;

    if (!eventId || !meetLink || !htmlLink) {
      throw new Error(
        'Google Calendar response is missing eventId, hangoutLink, or htmlLink.',
      );
    }

    return { eventId, meetLink, htmlLink };
  }

  async cancelMeetEvent(eventId: string): Promise<void> {
    if (!this.calendar) {
      throw new Error('Google Calendar client is not configured.');
    }

    await this.calendar.events.delete({
      calendarId: this.calendarId,
      eventId,
      sendUpdates: 'all',
    });
  }
}
