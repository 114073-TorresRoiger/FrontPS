import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from 'stream-chat';
import { Router } from '@angular/router';

// Services
import { StreamChatService } from './services/stream-chat.service';
import { ChatRepository } from '../../domain/chat/chat.repository';
import { AuthService } from '../../domain/auth/auth.service';

// Components
import { ChatChannelListComponent } from './components/chat-channel-list/chat-channel-list.component';
import { ChatChannelComponent } from './components/chat-channel/chat-channel.component';
import { ProfessionalSelectionModalComponent } from './components/professional-selection-modal/professional-selection-modal.component';

// Models
import { Professional } from '../../domain/chat/chat.model';

interface ProfessionalForChat {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChatChannelListComponent,
    ChatChannelComponent,
    ProfessionalSelectionModalComponent,
  ],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  private readonly streamChatService = inject(StreamChatService);
  private readonly chatRepository = inject(ChatRepository);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild(ProfessionalSelectionModalComponent)
  professionalModal!: ProfessionalSelectionModalComponent;
  @ViewChild(ChatChannelListComponent)
  channelList!: ChatChannelListComponent;

  selectedChannel: Channel | null = null;
  isConnecting = false;
  connectionError: string | null = null;
  currentUserId: string | null = null;

  ngOnInit(): void {
    // Obtener usuario autenticado
    const user = this.authService.currentUser();
    
    if (!user || !user.id) {
      // Si no hay usuario autenticado, redirigir al login
      this.connectionError = 'Debes iniciar sesión para usar el chat';
      this.router.navigate(['/auth/login']);
      return;
    }

    // Conectar automáticamente con el usuario autenticado
    this.connectUser(user.id.toString());

    this.streamChatService.currentUserId$.subscribe((userId) => {
      this.currentUserId = userId;
      console.log('🔍 currentUserId actualizado:', this.currentUserId);
    });
  }

  ngOnDestroy(): void {
    // Desconectar al salir (opcional, dependiendo de tu lógica)
    // this.streamChatService.disconnectUser();
  }

  /**
   * Conectar usuario al chat automáticamente desde AuthService
   */
  private async connectUser(userId: string): Promise<void> {
    this.isConnecting = true;
    this.connectionError = null;

    try {
      await this.streamChatService.connectUser(userId).toPromise();
      console.log('✅ Usuario conectado al chat:', userId);
    } catch (error: any) {
      console.error('Error conectando usuario:', error);
      this.connectionError = 'Error al conectar al chat. Por favor intenta nuevamente.';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 3000);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Desconectar usuario del chat
   */
  async logout(): Promise<void> {
    await this.streamChatService.disconnectUser();
    this.router.navigate(['/home']);
  }

  /**
   * Manejar selección de canal
   */
  onChannelSelected(channel: Channel): void {
    this.selectedChannel = channel;
  }

  /**
   * Abrir modal de selección de profesional
   */
  onNewChatRequested(): void {
    console.log('🔍 Abriendo modal con userId:', this.currentUserId);
    this.professionalModal?.open();
  }

  /**
   * Crear conversación con profesional seleccionado
   */
  async onProfessionalSelected(professional: ProfessionalForChat): Promise<void> {
    if (!this.currentUserId) {
      console.error('No hay usuario conectado');
      return;
    }

    try {
      // Crear conversación con el profesional
      const result = await this.chatRepository
        .createConversationWithProfessional({
          userId: this.currentUserId,
          professionalId: professional.id,
        })
        .toPromise();

      if (result) {
        // Obtener el canal y abrirlo
        const channel = await this.streamChatService.getChannel(result.type, result.id);
        this.selectedChannel = channel;

        // Recargar lista de conversaciones
        if (this.channelList) {
          await this.channelList.loadChannels();
        }
      }
    } catch (error) {
      console.error('Error creando conversación con profesional:', error);
      alert('Error al crear la conversación. Intenta nuevamente.');
    }
  }
}
