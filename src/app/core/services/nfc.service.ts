import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NfcService {
  private http = inject(HttpClient);

  linkCard(payload: { attendeeId: string; nfcUid: string }) {
    return this.http.patch(`${environment.apiUrl}/attendees/nfc-link`, payload);
  }

  logAttendance(payload: { attendeeId: string; courseId: string }) {
    return this.http.post(`${environment.apiUrl}/attendance/log`, payload);
  }
}
