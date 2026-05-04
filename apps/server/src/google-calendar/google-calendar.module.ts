import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { MEET_SERVICE } from '../common/interfaces/MeetEventInterfaces';

@Module({
  providers: [
    GoogleCalendarService,
    { provide: MEET_SERVICE, useExisting: GoogleCalendarService },
  ],
  exports: [MEET_SERVICE],
})
export class GoogleCalendarModule {}
