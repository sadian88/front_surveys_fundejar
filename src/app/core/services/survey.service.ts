import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PublicSurvey {
  id: number;
  title: string;
  config: {
    title: string;
    description?: string;
    sections?: Array<{
      id: string;
      title: string;
      questions?: Array<{
        id: string;
        type: string;
        label: string;
        required?: boolean;
        placeholder?: string;
        options?: Array<{ label: string; value: string }>;
        dependency?: { parentQuestionId: string; triggerValue: string };
        config?: { min?: number; max?: number; step?: number; multiple?: boolean };
      }>;
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private http = inject(HttpClient);

  getActiveSurvey() {
    return this.http.get<PublicSurvey>(`${environment.apiUrl}/admin/surveys/public/active`);
  }

  savePartial(payload: { attendeeId: number; surveyId: number; questionId: string; value: any }) {
    return this.http.post(`${environment.apiUrl}/admin/surveys/public/save-partial`, payload);
  }

  getPartialResponse(payload: { attendeeId: number; surveyId: number }) {
    return this.http.get<{
      answers: Record<string, any>;
      progress: number;
      isCompleted: boolean;
      updatedAt: string | null;
    }>(`${environment.apiUrl}/admin/surveys/public/response`, {
      params: {
        attendeeId: String(payload.attendeeId),
        surveyId: String(payload.surveyId),
      },
    });
  }

  finalize(payload: { attendeeId: number; surveyId: number }) {
    return this.http.post(`${environment.apiUrl}/admin/surveys/public/finalize`, payload);
  }
}
