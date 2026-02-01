import { Injectable, effect, signal } from '@angular/core';

export interface AttendeeProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

const PROFILE_KEY = 'attendee_profile';
const ATTENDEE_KEY = 'attendee_id';
const TOKEN_KEY = 'attendee_token';
const DOCUMENT_KEY = 'attendee_document';

@Injectable({ providedIn: 'root' })
export class SessionService {
  attendeeId = signal<string | null>(this.readValue(ATTENDEE_KEY));
  token = signal<string | null>(this.readValue(TOKEN_KEY));
  profile = signal<AttendeeProfile | null>(this.readProfile());
  documentNumber = signal<string | null>(this.readValue(DOCUMENT_KEY));

  constructor() {
    effect(() => this.persistValue(ATTENDEE_KEY, this.attendeeId()));
    effect(() => this.persistValue(TOKEN_KEY, this.token()));
    effect(() => this.persistProfile(this.profile()));
    effect(() => this.persistValue(DOCUMENT_KEY, this.documentNumber()));
  }

  setSession(attendeeId: string, token: string) {
    this.attendeeId.set(attendeeId);
    this.token.set(token);
  }

  setProfile(profile: AttendeeProfile) {
    this.profile.set(profile);
  }

  setDocumentNumber(documentNumber: string) {
    this.documentNumber.set(documentNumber);
  }

  clear() {
    this.attendeeId.set(null);
    this.token.set(null);
    this.profile.set(null);
    this.documentNumber.set(null);
  }

  private readValue(key: string) {
    const value = localStorage.getItem(key);
    return value && value.length > 0 ? value : null;
  }

  private readProfile() {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AttendeeProfile;
    } catch {
      return null;
    }
  }

  private persistValue(key: string, value: string | null) {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }

  private persistProfile(profile: AttendeeProfile | null) {
    if (profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  }
}
