import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';

@Module({
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
