import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RegistrationService } from '../services/registration.service';
import { SessionService } from '../services/session.service';
import { map, catchError, of } from 'rxjs';

export const surveyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const registrationService = inject(RegistrationService);
  const session = inject(SessionService);

  const documentNumber = session.documentNumber();
  if (!documentNumber) {
    router.navigate(['/access']);
    return of(false);
  }

  return registrationService.validateAccess(documentNumber, 'CEDULA').pipe(
    map((res) => {
      if (!res.registered || !res.canContinue) {
        router.navigate(['/access']);
        return false;
      }
      if (res.attendeeId) {
        session.setSession(String(res.attendeeId), session.token() ?? '');
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/access']);
      return of(false);
    })
  );
};
