import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);

  sendMessage(payload: { attendeeId: string; message: string }) {
    return this.http.post<{ reply: string }>(`${environment.apiUrl}/ai/chat-query`, payload);
  }
}
