import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type DocumentType = 'IDENTIDAD' | 'CEDULA' | 'PASAPORTE' | 'PEP';
export type GenderType = 'FEMENINO' | 'MASCULINO' | 'OTRO';

export interface RegistrationPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  nationality: string;
  birthDate: string;
  documentType: DocumentType;
  documentNumber: string;
  gender?: GenderType;
  age?: number | null;
  address?: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email?: string;
  ventureName: string;
}

export interface Registration extends RegistrationPayload {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccessValidationResponse {
  registered: boolean;
  canContinue: boolean;
  attendeeId?: number;
  surveyId?: number;
  reason?: 'MISSING_DOCUMENT' | 'NOT_REGISTERED' | 'NO_ACTIVE_SURVEY' | 'PENDING' | 'COMPLETED';
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/registrations`;

  list() {
    return this.http.get<Registration[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.http.get<Registration>(`${this.baseUrl}/${id}`);
  }

  create(payload: RegistrationPayload) {
    return this.http.post<Registration>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<RegistrationPayload>) {
    return this.http.patch<Registration>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}`);
  }

  validateAccess(documentNumber: string, documentType?: DocumentType) {
    const params: any = { documentNumber };
    if (documentType) params.documentType = documentType;
    return this.http.get<AccessValidationResponse>(`${this.baseUrl}/validate`, { params });
  }

  getProfile(documentNumber: string) {
    return this.http.get<any>(`${this.baseUrl}/profile/${documentNumber}`);
  }
}
