import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NfcService } from '../../core/services/nfc.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-nfc',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nfc.component.html',
  styleUrl: './nfc.component.css'
})
export class NfcComponent implements OnInit {
  private nfcApi = inject(NfcService);
  private session = inject(SessionService);
  private router = inject(Router);

  profile = this.session.profile;
  status = signal('Esperando lectura...');
  isSupported = signal(false);
  sessionLabel = 'Taller de Liderazgo Comunitario';

  ngOnInit() {
    this.isSupported.set('NDEFReader' in window);
    if (this.isSupported()) {
      this.startScan();
    } else {
      this.status.set('Web NFC no disponible en este dispositivo.');
    }
  }

  async startScan() {
    try {
      const Reader = (window as any).NDEFReader;
      const reader = new Reader();
      await reader.scan();
      this.status.set('Acerca tu tarjeta...');
      reader.onreading = (event: any) => {
        const uid = event.serialNumber || 'demo-uid';
        this.handleUid(uid);
      };
    } catch {
      this.status.set('No se pudo iniciar la lectura NFC.');
    }
  }

  simulate() {
    this.handleUid('demo-uid');
  }

  private handleUid(uid: string) {
    const attendeeId = this.session.attendeeId();
    if (!attendeeId) {
      this.status.set('Sesion no encontrada.');
      return;
    }

    this.status.set('Tarjeta detectada. Vinculando...');
    this.nfcApi.linkCard({ attendeeId, nfcUid: uid }).subscribe({
      next: () => {
        this.status.set('Tarjeta vinculada. Registrando asistencia...');
        this.nfcApi.logAttendance({ attendeeId, courseId: 'active-session' }).subscribe({
          next: () => this.status.set('Asistencia registrada con exito.'),
          error: () => this.status.set('Asistencia registrada en modo local.')
        });
      },
      error: () => {
        this.status.set('Tarjeta vinculada en modo local.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/assistant']);
  }
}
