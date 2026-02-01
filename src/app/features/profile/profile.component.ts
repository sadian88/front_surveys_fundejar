import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RegistrationService } from '../../core/services/registration.service';
import { SessionService } from '../../core/services/session.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
    private registrationService = inject(RegistrationService);
    private session = inject(SessionService);
    private router = inject(Router);

    profileData = signal<any>(null);
    isLoading = signal(true);
    selectedSurvey = signal<any>(null);
    activeTab = signal<'info' | 'surveys'>('info');

    attendeeProgress = computed(() => this.profileData()?.attendee?.surveyProgress || 0);

    ngOnInit() {
        const doc = this.session.documentNumber();
        if (!doc) {
            this.router.navigate(['/access']);
            return;
        }

        this.registrationService.getProfile(doc).subscribe({
            next: (data) => {
                this.profileData.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.router.navigate(['/access']);
            }
        });
    }

    toggleSurvey(survey: any) {
        if (this.selectedSurvey()?.id === survey.id) {
            this.selectedSurvey.set(null);
        } else {
            this.selectedSurvey.set(survey);
        }
    }

    formatValue(value: any): string {
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        return String(value || 'N/A');
    }
    logout() {
        this.router.navigate(['/access']);
    }
}
