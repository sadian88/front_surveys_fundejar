import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SurveyFlowService, SurveyQuestion } from '../../core/services/survey-flow.service';
import { SurveyService } from '../../core/services/survey.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.css'
})
export class SurveyComponent implements OnInit {
  flow = inject(SurveyFlowService);
  private surveyApi = inject(SurveyService);
  private session = inject(SessionService);
  private router = inject(Router);

  isLoading = true;
  errorMessage = '';

  stepLabel = this.flow.progressLabel;
  progress = this.flow.progressPercent;
  currentQuestion = this.flow.currentQuestion;
  surveyTitle = this.flow.surveyTitle;
  profile = this.session.profile;
  profileInitials = computed(() => {
    const name = this.profile()?.name || 'Usuario';
    const parts = name.split(' ').filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '');
    return letters.join('') || 'U';
  });

  autoSaveLabel = computed(() => {
    const savedAt = this.flow.lastSavedAt();
    if (!savedAt) return 'Autoguardado pendiente';
    const seconds = Math.max(1, Math.floor((Date.now() - savedAt.getTime()) / 1000));
    return `Autoguardado hace ${seconds}s`;
  });

  ngOnInit() {
    this.surveyApi.getActiveSurvey().subscribe({
      next: (survey) => {
        const attendeeId = this.session.attendeeId();
        if (!attendeeId) {
          this.flow.loadFromSurvey(survey);
          this.isLoading = false;
          return;
        }

        this.surveyApi.getPartialResponse({
          attendeeId: Number(attendeeId),
          surveyId: survey.id,
        }).subscribe({
          next: (response) => {
            this.flow.loadFromSurvey(survey, response.answers || {});
            this.isLoading = false;
          },
          error: () => {
            this.flow.loadFromSurvey(survey);
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No hay encuestas activas en este momento.';
      }
    });
  }

  setRating(value: number) {
    const question = this.currentQuestion();
    if (!question) return;
    this.flow.setAnswer(question.id, value);
    this.savePartial(question.id, value);
  }

  setChoice(value: string) {
    const question = this.currentQuestion();
    if (!question) return;
    this.flow.setAnswer(question.id, value);
    this.savePartial(question.id, value);
  }

  setText(value: string) {
    const question = this.currentQuestion();
    if (!question) return;
    this.flow.setAnswer(question.id, value);
    this.savePartial(question.id, value);
  }

  toggleMulti(value: string) {
    const question = this.currentQuestion();
    if (!question) return;
    const current = this.currentAnswer();
    const next = Array.isArray(current) ? [...current] : [];
    const index = next.indexOf(value);
    if (index >= 0) {
      next.splice(index, 1);
    } else {
      next.push(value);
    }
    this.flow.setAnswer(question.id, next);
    this.savePartial(question.id, next);
  }

  previous() {
    this.flow.previous();
  }

  next() {
    const total = this.flow.visibleQuestions().length;
    if (this.flow.stepIndex() + 1 >= total) {
      this.router.navigate(['/summary']);
      return;
    }
    this.flow.next();
  }

  goToAssistant() {
    this.router.navigate(['/assistant']);
  }

  currentAnswer() {
    const question = this.currentQuestion();
    if (!question) return null;
    return this.flow.answers()[question.id];
  }

  ratingValues(question: SurveyQuestion) {
    const min = question.config?.min ?? 1;
    const max = question.config?.max ?? 5;
    const step = question.config?.step ?? 1;
    const values: number[] = [];
    for (let value = min; value <= max; value += step) {
      values.push(value);
    }
    return values;
  }

  isMultiSelected(value: string) {
    const current = this.currentAnswer();
    return Array.isArray(current) && current.includes(value);
  }

  private savePartial(questionId: string, value: any) {
    const attendeeId = this.session.attendeeId();
    const surveyId = this.flow.surveyId();
    if (!attendeeId || !surveyId) return;
    this.surveyApi.savePartial({
      attendeeId: Number(attendeeId),
      surveyId,
      questionId,
      value
    }).subscribe({
      error: () => undefined
    });
  }
}
