import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SurveyFlowService } from '../../core/services/survey-flow.service';
import { SurveyService } from '../../core/services/survey.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent {
  flow = inject(SurveyFlowService);
  private surveyApi = inject(SurveyService);
  private session = inject(SessionService);
  private router = inject(Router);

  profile = this.session.profile;

  initials() {
    const name = this.profile()?.name || 'Usuario';
    const parts = name.split(' ').filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '');
    return letters.join('') || 'U';
  }

  formatAnswer(value: any) {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Sin respuesta';
    }
    if (value === undefined || value === null || value === '') {
      return 'Sin respuesta';
    }
    return String(value);
  }

  edit(questionId: string) {
    this.flow.goTo(questionId);
    this.router.navigate(['/survey']);
  }

  finalize() {
    const attendeeId = this.session.attendeeId();
    const surveyId = this.flow.surveyId();

    if (!attendeeId || !surveyId) {
      this.router.navigate(['/nfc']);
      return;
    }

    this.surveyApi.finalize({
      attendeeId: Number(attendeeId),
      surveyId: Number(surveyId)
    }).subscribe({
      next: () => this.router.navigate(['/success']),
      error: () => this.router.navigate(['/success'])
    });
  }
}
