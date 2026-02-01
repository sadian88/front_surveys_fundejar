import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AiService } from '../../core/services/ai.service';
import { SessionService } from '../../core/services/session.service';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css'
})
export class AssistantComponent {
  private ai = inject(AiService);
  private session = inject(SessionService);

  messages = signal<ChatMessage[]>([
    {
      role: 'bot',
      text: 'Hola! Soy tu asistente de Fundejar. Puedo ayudarte a completar la encuesta.'
    }
  ]);
  draft = '';
  isTyping = signal(false);

  quickReplies = ['Si, empezar', 'Mas tarde', 'Soporte'];

  send() {
    const value = this.draft.trim();
    if (!value) return;

    this.appendMessage({ role: 'user', text: value });
    this.draft = '';
    this.isTyping.set(true);

    const attendeeId = this.session.attendeeId() || 'anon';
    this.ai.sendMessage({ attendeeId, message: value }).subscribe({
      next: (res) => {
        this.appendMessage({ role: 'bot', text: res.reply || 'Listo, te acompano en el proceso.' });
        this.isTyping.set(false);
      },
      error: () => {
        this.appendMessage({
          role: 'bot',
          text: 'Estoy aqui para ayudarte. Quieres continuar con la encuesta?'
        });
        this.isTyping.set(false);
      }
    });
  }

  sendQuick(value: string) {
    this.draft = value;
    this.send();
  }

  private appendMessage(message: ChatMessage) {
    this.messages.update((list) => [...list, message]);
  }
}
