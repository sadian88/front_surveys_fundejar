import { Routes } from '@angular/router';
import { AccessComponent } from './features/access/access.component';
import { RegisterComponent } from './features/register/register.component';
import { SurveyComponent } from './features/survey/survey.component';
import { SummaryComponent } from './features/summary/summary.component';
import { NfcComponent } from './features/nfc/nfc.component';
import { AssistantComponent } from './features/assistant/assistant.component';
import { SuccessComponent } from './features/success/success.component';
import { ProfileComponent } from './features/profile/profile.component';
import { surveyGuard } from './core/guards/survey.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'access', pathMatch: 'full' },
  { path: 'access', component: AccessComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register/:id', component: RegisterComponent },
  { path: 'survey', component: SurveyComponent, canActivate: [surveyGuard] },
  { path: 'summary', component: SummaryComponent },
  { path: 'nfc', component: NfcComponent },
  { path: 'assistant', component: AssistantComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: 'access' }
];
