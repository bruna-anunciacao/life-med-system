export interface CreateMeetEventInput {
  requestId: string;
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  attendees: { email: string; displayName?: string }[];
}

export interface CreateMeetEventResult {
  eventId: string;
  meetLink: string;
  htmlLink: string; // Specific for google api, if other calendar provide extend the interface
}

export interface MeetService {
  createMeetEvent(input: CreateMeetEventInput): Promise<CreateMeetEventResult>;
  cancelMeetEvent(eventId: string): Promise<void>;
}
