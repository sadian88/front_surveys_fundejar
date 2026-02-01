import { Injectable, computed, effect, signal } from '@angular/core';
import { PublicSurvey } from './survey.service';

export type SurveyQuestionType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'number'
  | 'date'
  | 'rating'
  | 'email'
  | 'file'
  | 'signature';

export interface SurveyQuestion {
  id: string;
  label: string;
  type: SurveyQuestionType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  dependency?: { parentQuestionId: string; triggerValue: string };
  config?: { min?: number; max?: number; step?: number; multiple?: boolean };
}

@Injectable({ providedIn: 'root' })
export class SurveyFlowService {
  surveyId = signal<number | null>(null);
  surveyTitle = signal<string>('Encuesta');
  allQuestions = signal<SurveyQuestion[]>([]);
  stepIndex = signal(0);
  answers = signal<Record<string, any>>({});
  lastSavedAt = signal<Date | null>(null);

  visibleQuestions = computed(() => {
    const answers = this.answers();
    return this.allQuestions().filter((q) => this.isQuestionVisible(q, answers));
  });

  currentQuestion = computed(() => this.visibleQuestions()[this.stepIndex()]);

  progressPercent = computed(() => {
    const visible = this.visibleQuestions();
    if (visible.length === 0) return 0;
    const answers = this.answers();
    const answeredCount = visible.filter((q) => this.isAnswered(answers[q.id])).length;
    return Math.round((answeredCount / visible.length) * 100);
  });

  progressLabel = computed(() => {
    const total = this.visibleQuestions().length;
    if (total === 0) return 'Paso 0 de 0';
    return `Paso ${this.stepIndex() + 1} de ${total}`;
  });

  summaryItems = computed(() => {
    const answers = this.answers();
    return this.allQuestions().map((q) => ({
      id: q.id,
      title: q.label,
      value: answers[q.id]
    }));
  });

  constructor() {
    effect(() => {
      const total = this.visibleQuestions().length;
      if (total === 0) {
        this.stepIndex.set(0);
        return;
      }
      if (this.stepIndex() > total - 1) {
        this.stepIndex.set(total - 1);
      }
    });
  }

  loadFromSurvey(survey: PublicSurvey, existingAnswers: Record<string, any> = {}) {
    this.surveyId.set(survey.id);
    this.surveyTitle.set(survey.config?.title || survey.title || 'Encuesta');
    this.allQuestions.set(this.flattenSurvey(survey));
    this.answers.set(existingAnswers);
    this.lastSavedAt.set(Object.keys(existingAnswers).length > 0 ? new Date() : null);

    const visible = this.allQuestions().filter((q) => this.isQuestionVisible(q, existingAnswers));
    const nextIndex = visible.findIndex((q) => !this.isAnswered(existingAnswers[q.id]));
    this.stepIndex.set(nextIndex >= 0 ? nextIndex : 0);
  }

  setAnswer(questionId: string, value: any) {
    this.answers.update((prev) => ({ ...prev, [questionId]: value }));
    this.lastSavedAt.set(new Date());
  }

  next() {
    const total = this.visibleQuestions().length;
    this.stepIndex.update((index) => (index < total - 1 ? index + 1 : index));
  }

  previous() {
    this.stepIndex.update((index) => (index > 0 ? index - 1 : index));
  }

  goTo(questionId: string) {
    const index = this.visibleQuestions().findIndex((q) => q.id === questionId);
    if (index >= 0) {
      this.stepIndex.set(index);
    }
  }

  reset() {
    this.stepIndex.set(0);
    this.answers.set({});
    this.lastSavedAt.set(null);
  }

  private flattenSurvey(survey: PublicSurvey) {
    const result: SurveyQuestion[] = [];
    survey.config?.sections?.forEach((section) => {
      section.questions?.forEach((question) => {
        if (question.type === 'section_break') return;
        result.push({
          id: question.id,
          label: question.label || 'Pregunta',
          type: question.type as SurveyQuestionType,
          placeholder: question.placeholder,
          required: question.required,
          options: question.options?.map((opt) => opt.label || opt.value),
          dependency: question.dependency,
          config: question.config
        });
      });
    });
    return result;
  }

  private isQuestionVisible(question: SurveyQuestion, answers: Record<string, any>) {
    const dependency = question.dependency;
    if (!dependency) return true;
    const parentValue = answers[dependency.parentQuestionId];
    if (parentValue === undefined || parentValue === null || parentValue === '') return false;
    const triggerValue = String(dependency.triggerValue);

    if (Array.isArray(parentValue)) {
      return parentValue.map((value) => String(value)).includes(triggerValue);
    }

    return String(parentValue) === triggerValue;
  }

  private isAnswered(value: any) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  }
}
