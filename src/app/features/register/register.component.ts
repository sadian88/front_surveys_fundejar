import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RegistrationPayload, RegistrationService } from '../../core/services/registration.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private registrationService = inject(RegistrationService);
  private session = inject(SessionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  progressValue = 75;
  isSaving = false;
  isLoading = false;
  isEdit = false;
  recordId: number | null = null;
  errorMessage = '';

  form: RegistrationPayload = {
    firstName: '',
    middleName: '',
    lastName: '',
    nationality: '',
    birthDate: '',
    documentType: 'IDENTIDAD',
    documentNumber: '',
    gender: undefined,
    age: null,
    address: '',
    phonePrimary: '',
    phoneSecondary: '',
    email: '',
    ventureName: ''
  };

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;
    const id = Number(idParam);
    if (Number.isNaN(id)) return;
    this.isEdit = true;
    this.recordId = id;
    this.isLoading = true;
    this.registrationService.getById(id).subscribe({
      next: (data) => {
        this.form = {
          firstName: data.firstName,
          middleName: data.middleName || '',
          lastName: data.lastName,
          nationality: data.nationality,
          birthDate: data.birthDate,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          gender: data.gender,
          age: data.age ?? null,
          address: data.address || '',
          phonePrimary: data.phonePrimary,
          phoneSecondary: data.phoneSecondary || '',
          email: data.email || '',
          ventureName: data.ventureName
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  register() {
    if (!this.form.firstName || !this.form.lastName || !this.form.documentNumber) {
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    const payload: RegistrationPayload = {
      ...this.form,
      middleName: this.form.middleName || undefined,
      phoneSecondary: this.form.phoneSecondary || undefined,
      gender: this.form.gender || undefined,
      age: this.form.age ?? undefined,
      address: this.form.address || undefined,
      email: this.form.email || undefined
    };

    const request = this.isEdit && this.recordId
      ? this.registrationService.update(this.recordId, payload)
      : this.registrationService.create(payload);

    request.subscribe({
      next: (res) => {
        this.isSaving = false;
        this.session.setProfile({
          name: `${res.firstName} ${res.lastName}`,
          email: res.email || ''
        });
        this.router.navigate(['/survey']);
      },
      error: (err) => {
        this.isSaving = false;
        if (err?.status === 409) {
          this.errorMessage = 'La cedula ya se encuentra registrada.';
        } else {
          this.errorMessage = 'No se pudo guardar el registro. Intente de nuevo.';
        }
      }
    });
  }
}
