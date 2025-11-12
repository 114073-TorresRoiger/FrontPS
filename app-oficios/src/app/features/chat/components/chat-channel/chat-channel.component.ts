import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel, Event, MessageResponse } from 'stream-chat';
import { StreamChatService } from '../../services/stream-chat.service';
import { Subscription } from 'rxjs';

interface DisplayMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
  isOwn: boolean;
}

@Component({
  selector: 'app-chat-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.scss'],
})
export class ChatChannelComponent implements OnInit, OnDestroy {
  private readonly streamChatService = inject(StreamChatService);
  private channelSubscription?: ReturnType<Channel['on']>;

  @Input() channel: Channel | null = null;

  messages: DisplayMessage[] = [];
  messageText = '';
  isLoading = false;
  currentUserId: string | null = null;

  ngOnInit(): void {
    this.streamChatService.currentUserId$.subscribe((userId) => {
      this.currentUserId = userId;
    });

    if (this.channel) {
      this.loadMessages();
      this.subscribeToNewMessages();
    }
  }

  ngOnDestroy(): void {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }

  async loadMessages(): Promise<void> {
    if (!this.channel) return;

    this.isLoading = true;
    try {
      const state = await this.channel.query({ messages: { limit: 50 } });
      this.messages = state.messages.map((msg) => this.mapMessage(msg));
      this.scrollToBottom();
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  subscribeToNewMessages(): void {
    if (!this.channel) return;

    this.channelSubscription = this.channel.on('message.new', (event: Event) => {
      if (event.message) {
        const newMessage = this.mapMessage(event.message);
        this.messages.push(newMessage);
        this.scrollToBottom();
      }
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.messageText.trim() || !this.channel) return;

    const text = this.messageText;
    this.messageText = '';

    try {
      await this.channel.sendMessage({ text });
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      this.messageText = text;
    }
  }

  private mapMessage(msg: MessageResponse): DisplayMessage {
    return {
      id: msg.id,
      text: msg.text || '',
      userId: msg.user?.id || '',
      userName: msg.user?.name || 'Usuario',
      createdAt: new Date(msg.created_at || Date.now()),
      isOwn: msg.user?.id === this.currentUserId,
    };
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messageList = document.querySelector('.message-list');
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }, 100);
  }

  getChannelName(): string {
    if (!this.channel) return 'Chat';
    const channelData: any = this.channel.data;
    return channelData?.name || 'Consulta Profesional';
  }

  getInitial(): string {
    return this.getChannelName().charAt(0).toUpperCase();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
