import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

export interface AttendeeResponse {
  id: number;
  documentNumber: string;
  fullName: string;
  surveyProgress?: number;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  socialGroup: string;
  ventureName: string;
  ventureSector: string;
  documentNumber: string;
}

@Injectable({ providedIn: 'root' })
export class AttendeeService {
  private http = inject(HttpClient);
  private session = inject(SessionService);

  verify(documentNumber: string, fullName = '') {
    return this.http
      .post<AttendeeResponse>(`${environment.apiUrl}/attendees/verify`, {
        documentNumber,
        fullName
      })
      .pipe(
        tap((res) => {
          this.session.setSession(String(res.id), this.session.token() ?? '');
        })
      );
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AttendeeResponse>(`${environment.apiUrl}/attendees/verify`, {
        documentNumber: payload.documentNumber,
        fullName: `${payload.firstName} ${payload.lastName}`.trim()
      })
      .pipe(
        tap((res) => {
          this.session.setSession(String(res.id), this.session.token() ?? '');
        })
      );
  }
}
