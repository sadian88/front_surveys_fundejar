import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegistrationService } from '../../core/services/registration.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './access.component.html',
  styleUrl: './access.component.css'
})
export class AccessComponent {
  private registrationService = inject(RegistrationService);
  private session = inject(SessionService);
  private router = inject(Router);

  documentNumber = '';
  errorMessage = '';
  isLoading = false;

  validate() {
    const doc = this.documentNumber.trim();
    if (!doc) {
      this.errorMessage = 'Ingrese un documento valido.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.registrationService.validateAccess(doc, 'CEDULA').subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.registered) {
          this.errorMessage = 'Documento no registrado. Complete el registro para continuar.';
          return;
        }
        if (!res.canContinue) {
          this.session.setDocumentNumber(doc);
          this.router.navigate(['/profile']);
          return;
        }
        this.session.setDocumentNumber(doc);
        if (res.attendeeId) {
          this.session.setSession(String(res.attendeeId), this.session.token() ?? '');
        }
        this.router.navigate(['/survey']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No se pudo validar el documento. Intente de nuevo.';
      }
    });
  }
}
