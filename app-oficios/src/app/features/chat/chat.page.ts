import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StreamChatService } from './services/stream-chat.service';
import { AuthService } from '../../domain/auth/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  template: `
    <div class="chat-container">
      <!-- Loading State -->
      <div class="loading-screen" *ngIf="isConnecting">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>💬 Conectando al Chat</p>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-screen" *ngIf="connectionError && !isConnecting">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <h2>Error de Conexión</h2>
          <p>{{ connectionError }}</p>
          <button class="btn-primary" (click)="goToHome()">Volver al Inicio</button>
        </div>
      </div>

      <!-- Chat Interface -->
      <div class="str-chat-angular" *ngIf="!isConnecting && !connectionError">
        <div class="chat-layout">
          <!-- Sidebar with Channel List -->
          <div class="chat-sidebar">
            <div class="sidebar-header">
              <h2>Mensajes</h2>
              <button class="btn-logout" (click)="goToHome()">Salir</button>
            </div>

            <div class="new-chat-section">
              <button 
                class="btn-new-chat" 
                (click)="openProfessionalModal()"
                *ngIf="!isProfessional"
              >
                ➕ Nueva Consulta
              </button>
              <div *ngIf="isProfessional" class="professional-info">
                <p>💼 Modo Profesional</p>
                <small>Tus clientes pueden iniciar conversaciones contigo</small>
              </div>
            </div>

            <!-- Lista de Conversaciones -->
            <div class="channels-section">
              <div *ngIf="loadingChannels" class="loading-channels">
                <div class="spinner"></div>
                <p>Cargando conversaciones...</p>
              </div>

              <div *ngIf="!loadingChannels && channels.length === 0" class="no-channels">
                <p>No hay conversaciones aún</p>
              </div>

              <div *ngIf="!loadingChannels && channels.length > 0" class="channels-list">
                <div 
                  *ngFor="let channel of channels"
                  class="channel-item"
                  [class.active]="activeChannel?.channel?.id === channel.id"
                  (click)="selectChannel(channel)"
                >
                  <div class="channel-avatar">
                    {{ getChannelName(channel).charAt(0) }}
                  </div>
                  <div class="channel-info">
                    <h4>{{ getChannelName(channel) }}</h4>
                    <p class="last-message">{{ getLastMessage(channel) }}</p>
                  </div>
                  <div *ngIf="channel.state?.unreadCount > 0" class="unread-badge">
                    {{ channel.state.unreadCount }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Chat Area -->
          <div class="chat-main">
            <div *ngIf="!activeChannel" class="no-chat-selected">
              <div class="no-chat-content">
                <span class="chat-icon">💬</span>
                <h3>Selecciona una conversación</h3>
                <p>Elige un profesional para comenzar a chatear</p>
              </div>
            </div>

            <div *ngIf="activeChannel" class="active-chat">
              <!-- Chat Header -->
              <div class="chat-header">
                <div class="header-info">
                  <h3>{{ activeChannel.name }}</h3>
                  <span class="status-online">● En línea</span>
                </div>
              </div>

              <!-- Messages Area -->
              <div class="messages-container">
                <div *ngIf="loadingMessages" class="loading-messages">
                  <div class="spinner"></div>
                  <p>Cargando mensajes...</p>
                </div>

                <div *ngIf="!loadingMessages && messages.length === 0" class="no-messages">
                  <p>👋 ¡Inicia la conversación!</p>
                </div>

                <div *ngIf="!loadingMessages && messages.length > 0" class="messages-list">
                  <div 
                    *ngFor="let message of messages" 
                    class="message-item"
                    [class.own-message]="message.user?.id === userId"
                  >
                    <div class="message-avatar">
                      {{ message.user?.name?.charAt(0) || '?' }}
                    </div>
                    <div class="message-content">
                      <div class="message-header">
                        <span class="message-author">{{ message.user?.name || 'Usuario' }}</span>
                        <span class="message-time">{{ formatMessageTime(message.created_at) }}</span>
                      </div>
                      <div class="message-text">{{ message.text }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message Input -->
              <div class="message-input-container">
                <input
                  type="text"
                  [(ngModel)]="newMessage"
                  (keyup.enter)="sendMessage()"
                  placeholder="Escribe un mensaje..."
                  class="message-input"
                />
                <button 
                  (click)="sendMessage()" 
                  [disabled]="!newMessage.trim()"
                  class="btn-send"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Selection Modal -->
      <div class="modal-overlay" *ngIf="showProfessionalModal" (click)="closeProfessionalModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Selecciona un Profesional</h2>
            <button class="btn-close" (click)="closeProfessionalModal()">✕</button>
          </div>

          <div class="modal-body">
            <div *ngIf="loadingProfessionals" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando profesionales...</p>
            </div>

            <div *ngIf="!loadingProfessionals && professionals.length > 0" class="professionals-list">
              <div
                *ngFor="let prof of professionals"
                class="professional-card"
                (click)="selectProfessional(prof)"
              >
                <div class="professional-avatar" [style.background-image]="prof.imagenUrl ? 'url(' + prof.imagenUrl + ')' : 'none'">
                  <span *ngIf="!prof.imagenUrl">{{ prof.name.charAt(0) }}</span>
                </div>
                <div class="professional-info">
                  <h3>{{ prof.name }}</h3>
                  <p class="specialty">{{ prof.specialty }}</p>
                  <span class="status-badge" [class.accepted]="prof.estado === 'ACEPTADA'">
                    {{ prof.estado === 'ACEPTADA' ? '✓ Solicitud Aceptada' : '⏱ Pendiente' }}
                  </span>
                </div>
                <span class="chat-arrow">💬</span>
              </div>
            </div>

            <div *ngIf="!loadingProfessionals && professionals.length === 0" class="empty-state">
              <p>📋 No has enviado solicitudes aún</p>
              <small>Envía solicitudes a profesionales desde la página principal para poder iniciar conversaciones</small>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeProfessionalModal()">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  private streamChatService = inject(StreamChatService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isConnecting = true;
  connectionError: string | null = null;
  userId: string = '';
  showProfessionalModal = false;
  loadingProfessionals = false;
  professionals: any[] = [];
  activeChannel: any = null;
  messages: any[] = [];
  newMessage: string = '';
  loadingMessages = false;
  channels: any[] = [];
  loadingChannels = false;
  isProfessional = false;

  async ngOnInit(): Promise<void> {
    await this.initializeChat();
  }

  ngOnDestroy(): void {
    this.streamChatService.disconnectUser();
  }

  private async initializeChat(): Promise<void> {
    try {
      const user = this.authService.currentUser();

      if (!user || !user.id) {
        this.connectionError = 'Debes iniciar sesión para usar el chat';
        this.router.navigate(['/auth/login']);
        return;
      }

      this.userId = user.id.toString();
      const userName = (user as any).nombreCompleto || (user as any).nombre || 'Usuario';
      
      // Detectar si es profesional
      this.isProfessional = !!(user as any).idProfesional;
      
      console.log('🔍 Inicializando chat para usuario:', this.userId, 'Es profesional:', this.isProfessional);

      // Inicializar el cliente de Stream Chat
      await this.streamChatService.initializeChat(this.userId, userName);

      // Cargar conversaciones existentes
      await this.loadChannels();

      this.isConnecting = false;
      console.log('✅ Chat inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar chat:', error);
      this.connectionError = 'Error al conectar al chat. Por favor, intenta de nuevo.';
      this.isConnecting = false;
    }
  }

  async loadChannels(): Promise<void> {
    try {
      this.loadingChannels = true;
      const chatClient = this.streamChatService.getChatClient();
      
      console.log('🔍 Buscando canales para userId:', this.userId);
      console.log('🔍 Usuario conectado en Stream:', chatClient.userID);
      
      // Obtener canales del usuario
      const filter = { 
        type: 'messaging',
        members: { $in: [chatClient.userID || this.userId] }
      };
      
      console.log('🔍 Filtro de canales:', JSON.stringify(filter));
      
      const sort = [{ last_message_at: -1 as const }];
      
      const channels = await chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true
      });

      this.channels = channels;
      this.loadingChannels = false;
      
      console.log('✅ Canales cargados:', this.channels.length);
      if (this.channels.length > 0) {
        console.log('📋 Canales encontrados:', this.channels.map(c => ({
          id: c.id,
          members: Object.keys(c.state.members),
          lastMessage: c.state.last_message_at
        })));
      }
    } catch (error) {
      console.error('❌ Error cargando canales:', error);
      this.loadingChannels = false;
    }
  }

  selectChannel(channel: any): void {
    this.activeChannel = {
      channel: channel,
      name: this.getChannelName(channel)
    };
    this.loadMessages();
  }

  getChannelName(channel: any): string {
    if (!channel) return 'Chat';
    
    // Obtener el nombre del otro miembro (no el usuario actual)
    const members = Object.values(channel.state?.members || {}) as any[];
    const otherMember = members.find((m: any) => m.user?.id !== this.userId);
    
    return otherMember?.user?.name || channel.data?.name || 'Chat';
  }

  getLastMessage(channel: any): string {
    const messages = channel.state?.messages || [];
    if (messages.length === 0) return 'Sin mensajes';
    
    const lastMessage = messages[messages.length - 1];
    return lastMessage.text || 'Mensaje';
  }

  async openProfessionalModal(): Promise<void> {
    this.showProfessionalModal = true;
    this.loadingProfessionals = true;

    try {
      this.professionals = await this.streamChatService.getProfessionals();
      console.log('✅ Profesionales cargados:', this.professionals);
    } catch (error) {
      console.error('❌ Error cargando profesionales:', error);
      this.professionals = [];
    } finally {
      this.loadingProfessionals = false;
    }
  }

  closeProfessionalModal(): void {
    this.showProfessionalModal = false;
  }

  async selectProfessional(professional: any): Promise<void> {
    try {
      console.log('👤 Profesional seleccionado:', professional);

      const channel = await this.streamChatService.createConversationWithProfessional(
        this.userId,
        professional.id
      );

      console.log('✅ Canal creado:', channel);

      // Configurar canal activo
      this.activeChannel = {
        channel: channel,
        name: professional.name
      };

      // Cargar mensajes
      await this.loadMessages();

      // Recargar lista de canales
      await this.loadChannels();

      this.closeProfessionalModal();
    } catch (error) {
      console.error('❌ Error creando conversación:', error);
      alert('Error al crear la conversación. Por favor, intenta de nuevo.');
    }
  }

  async loadMessages(): Promise<void> {
    if (!this.activeChannel) return;

    try {
      this.loadingMessages = true;
      const state = await this.activeChannel.channel.watch();
      this.messages = state.messages || [];
      
      // Escuchar nuevos mensajes
      this.activeChannel.channel.on('message.new', (event: any) => {
        this.messages.push(event.message);
      });

      this.loadingMessages = false;
    } catch (error) {
      console.error('❌ Error cargando mensajes:', error);
      this.loadingMessages = false;
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.activeChannel) return;

    try {
      await this.activeChannel.channel.sendMessage({
        text: this.newMessage.trim()
      });

      this.newMessage = '';
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      alert('Error al enviar el mensaje');
    }
  }

  formatMessageTime(date: Date | string): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    return messageDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
