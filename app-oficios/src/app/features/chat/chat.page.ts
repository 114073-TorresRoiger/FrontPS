import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  StreamChatModule,
  StreamAutocompleteTextareaModule,
  ChatClientService,
  ChannelService,
  StreamI18nService,
} from 'stream-chat-angular';
import { StreamChatService } from './services/stream-chat.service';
import { AuthService } from '../../domain/auth/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    StreamChatModule,
    StreamAutocompleteTextareaModule,
  ],
  providers: [ChatClientService, ChannelService, StreamI18nService],
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
              <button class="btn-new-chat" (click)="openProfessionalModal()">
                ➕ Nueva Consulta
              </button>
            </div>

            <!-- Stream Chat Channel List -->
            <stream-channel-list></stream-channel-list>
          </div>

          <!-- Main Chat Area -->
          <div class="chat-main">
            <stream-channel>
              <!-- Message List -->
              <stream-message-list></stream-message-list>

              <!-- Message Input -->
              <stream-message-input></stream-message-input>

              <!-- Thread (respuestas) -->
              <stream-thread name="thread"></stream-thread>
            </stream-channel>
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
                <div class="professional-avatar">
                  {{ prof.name.charAt(0) }}
                </div>
                <div class="professional-info">
                  <h3>{{ prof.name }}</h3>
                  <p>{{ prof.specialty }}</p>
                </div>
                <span class="chat-arrow">→</span>
              </div>
            </div>

            <div *ngIf="!loadingProfessionals && professionals.length === 0" class="empty-state">
              <p>No hay profesionales disponibles</p>
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
  private chatClientService = inject(ChatClientService);

  isConnecting = true;
  connectionError: string | null = null;
  userId: string = '';
  showProfessionalModal = false;
  loadingProfessionals = false;
  professionals: any[] = [];

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
      
      console.log('🔍 Inicializando chat para usuario:', this.userId);

      // Inicializar el cliente de Stream Chat
      const chatClient = await this.streamChatService.initializeChat(this.userId, userName);
      
      // Pasar el cliente a ChatClientService
      this.chatClientService.chatClient = chatClient;

      this.isConnecting = false;
      console.log('✅ Chat inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar chat:', error);
      this.connectionError = 'Error al conectar al chat. Por favor, intenta de nuevo.';
      this.isConnecting = false;
    }
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

      this.closeProfessionalModal();
    } catch (error) {
      console.error('❌ Error creando conversación:', error);
      alert('Error al crear la conversación. Por favor, intenta de nuevo.');
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
