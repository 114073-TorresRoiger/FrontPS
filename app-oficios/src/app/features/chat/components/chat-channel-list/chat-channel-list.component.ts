import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from 'stream-chat';
import { StreamChatService } from '../../services/stream-chat.service';
import { ChatRepository } from '../../../../domain/chat/chat.repository';
import { GetUserConversationsUseCase } from '../../../../domain/chat/use-cases/get-user-conversations.usecase';

@Component({
  selector: 'app-chat-channel-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-channel-list.component.html',
  styleUrls: ['./chat-channel-list.component.scss'],
})
export class ChatChannelListComponent implements OnInit {
  private readonly streamChatService = inject(StreamChatService);
  private readonly getConversationsUseCase = inject(GetUserConversationsUseCase);

  @Output() channelSelected = new EventEmitter<Channel>();
  @Output() newChatRequested = new EventEmitter<void>();

  channels: Channel[] = [];
  selectedChannelId: string | null = null;
  isLoading = false;
  currentUserId: string | null = null;

  ngOnInit(): void {
    this.streamChatService.currentUserId$.subscribe((userId) => {
      this.currentUserId = userId;
      if (userId) {
        this.loadChannels();
      }
    });
  }

  async loadChannels(): Promise<void> {
    this.isLoading = true;
    try {
      this.channels = await this.streamChatService.getUserChannels();
    } catch (error) {
      console.error('Error cargando canales:', error);
    } finally {
      this.isLoading = false;
    }
  }

  selectChannel(channel: Channel): void {
    this.selectedChannelId = channel.id || null;
    this.channelSelected.emit(channel);
  }

  onNewChat(): void {
    this.newChatRequested.emit();
  }

  getChannelName(channel: Channel): string {
    const channelData = channel.data as any;
    return channelData?.name || 'Chat';
  }

  getChannelPreview(channel: Channel): string {
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];
    return lastMessage?.text || 'Sin mensajes';
  }

  getChannelInitial(channel: Channel): string {
    const name = this.getChannelName(channel);
    return name.charAt(0).toUpperCase();
  }

  getUnreadCount(channel: Channel): number {
    return channel.countUnread() || 0;
  }
}
