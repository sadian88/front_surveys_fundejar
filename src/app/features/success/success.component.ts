import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { SurveyFlowService } from '../../core/services/survey-flow.service';

@Component({
    selector: 'app-success',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './success.component.html',
    styleUrl: './success.component.css'
})
export class SuccessComponent {
    private session = inject(SessionService);
    private flow = inject(SurveyFlowService);

    profile = this.session.profile;

    constructor() {
        // Reset the survey flow when reaching success
        this.flow.reset();
    }
}
