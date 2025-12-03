import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StreamChatService } from './services/stream-chat.service';
import { AuthService } from '../../domain/auth/auth.service';
import { NotificacionService } from '../../data/notificaciones/notificacion.service';
import { Channel } from 'stream-chat';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule], // ✅ Importar CommonModule para *ngFor, *ngIf, etc.
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit, OnDestroy {
  // Helper para acceder al userId desde el template
  userId = () => this.currentUserId;
  
  channels: Channel[] = [];
  selectedChannel: Channel | null = null;
  messages: any[] = [];

  // Eliminación de mensajes
  selectedMessageToDelete: any = null;
  deleteModal: any;

  // Modal profesionales/clientes
  professionalModal: any;
  professionals: any[] = [];
  
  // Estados
  private currentUserId: string = '';
  isProfessional: boolean = false; // ✅ Público para usar en template
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private chatService: StreamChatService,
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeChat();
  }

  ngOnDestroy(): void {
    this.chatService.disconnectUser();
  }

  private async initializeChat(): Promise<void> {
    try {
      const user = this.authService.currentUser();

      if (!user || !user.id) {
        this.error = 'Debes iniciar sesión para usar el chat';
        this.router.navigate(['/auth/login']);
        return;
      }

      // Detectar si es profesional y obtener IDs correctos
      const userAny = user as any;
      this.isProfessional = !!userAny.idProfesional;
      
      // ✅ ID real del usuario (siempre user.id, nunca idProfesional)
      const realUserId = user.id.toString();
      
      // ID para Stream Chat (idProfesional si es profesional, sino user.id)
      this.currentUserId = this.isProfessional 
        ? userAny.idProfesional.toString()
        : realUserId;
      
      const userName = user.name && user.lastName 
        ? `${user.name} ${user.lastName}` 
        : user.name || 'Usuario';
      
      console.log('🔍 Inicializando chat:', {
        streamChatId: this.currentUserId,
        realUserId,
        isProfessional: this.isProfessional,
        userName,
        userObject: user
      });

      // Inicializar Stream Chat
      await this.chatService.initializeChat(
        this.currentUserId, 
        userName, 
        this.isProfessional,
        realUserId
      );

      // Cargar canales
      await this.loadChannels();
      
      // Cargar profesionales (para clientes) o clientes (para profesionales)
      await this.loadProfessionals();

      this.isLoading = false;
      console.log('✅ Chat inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar chat:', error);
      this.error = 'Error al conectar al chat';
      this.isLoading = false;
    }
  }

  async loadChannels(): Promise<void> {
    try {
      this.channels = await this.chatService.getUserChannels();
      console.log('✅ Canales cargados:', this.channels.length);
    } catch (error) {
      console.error('❌ Error cargando canales:', error);
    }
  }

  async loadProfessionals(): Promise<void> {
    try {
      // ✅ Si es profesional, cargar clientes. Si es cliente, cargar profesionales
      if (this.isProfessional) {
        this.professionals = await this.chatService.getClients();
        console.log('✅ Clientes cargados:', this.professionals.length);
      } else {
        this.professionals = await this.chatService.getProfessionals();
        console.log('✅ Profesionales cargados:', this.professionals.length);
      }
    } catch (error) {
      console.error('❌ Error cargando lista:', error);
      this.professionals = [];
    }
  }

  activeChannel() {
    return this.selectedChannel;
  }

  // Navegación
  goToHome(): void {
    this.router.navigate(['/home']);
  }

  // Selección de canal
  async openChannel(channel: Channel): Promise<void> {
    this.selectedChannel = channel;
    await this.loadMessages();
    // Actualizar contador de mensajes no leídos después de marcar como leído
    await this.updateUnreadCount();
  }

  // Obtención de nombre del canal
  getChannelName(channel: Channel): string {
    const members = Object.values(channel.state?.members || {}) as any[];
    const other = members.find((m) => m.user?.id !== this.currentUserId);
    const channelName = (channel.data as any)?.name;
    return other?.user?.name || channelName || 'Chat';
  }

  getLastMessage(channel: Channel): string {
    const msgs = channel.state?.messages || [];
    if (msgs.length === 0) return 'Sin mensajes';
    return msgs[msgs.length - 1].text || 'Mensaje';
  }

  getUnreadCount(channel: Channel): number {
    return channel.countUnread();
  }

  formatTime(timestamp: string | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async loadMessages(): Promise<void> {
    if (!this.selectedChannel) return;
    
    try {
      const state = this.selectedChannel.state;
      this.messages = (state.messages || []).filter((m: any) => !m.deleted_at);

      // Escuchar nuevos mensajes
      this.selectedChannel.on('message.new', () => this.loadMessages());
      this.selectedChannel.on('message.deleted', () => this.loadMessages());

      // Marcar como leído
      await this.selectedChannel.markRead();

      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('❌ Error cargando mensajes:', error);
    }
  }

  private async updateUnreadCount(): Promise<void> {
    try {
      const channels = await this.chatService.getUserChannels();
      let totalUnread = 0;
      
      for (const channel of channels) {
        totalUnread += channel.countUnread();
      }
      
      console.log('💬 Actualizando contador de mensajes no leídos:', totalUnread);
      this.notificacionService.actualizarMensajesNoLeidos(totalUnread);
    } catch (error) {
      console.error('❌ Error actualizando contador de mensajes:', error);
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.selectedChannel) return;
    
    const input = document.getElementById('messageInput') as HTMLInputElement;
    if (!input || !input.value.trim()) return;

    try {
      await this.selectedChannel.sendMessage({ text: input.value.trim() });
      input.value = '';
      await this.loadMessages();
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
    }
  }

  // Modal profesionales/clientes
  showProfessionalModal(): void {
    const modalElement = document.getElementById('professionalModal');
    if (!modalElement) {
      console.error('❌ Modal element not found');
      return;
    }

    // ✅ Verificar si Bootstrap está disponible
    if (typeof (window as any).bootstrap !== 'undefined') {
      this.professionalModal = new (window as any).bootstrap.Modal(modalElement);
      this.professionalModal.show();
    } else {
      // ✅ Fallback: mostrar modal manualmente
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
      
      // Crear backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'professionalModalBackdrop';
      document.body.appendChild(backdrop);
    }
  }

  closeProfessionalModal(): void {
    const modalElement = document.getElementById('professionalModal');
    
    if (this.professionalModal && typeof (window as any).bootstrap !== 'undefined') {
      this.professionalModal.hide();
    } else if (modalElement) {
      // ✅ Fallback: ocultar modal manualmente
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      
      // Remover backdrop
      const backdrop = document.getElementById('professionalModalBackdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }

  async selectProfessional(prof: any): Promise<void> {
    console.log('📤 Persona seleccionada:', prof);
    
    try {
      let channel: Channel;
      
      // ✅ Si es profesional, crear conversación con cliente
      if (this.isProfessional) {
        channel = await this.chatService.createConversationWithClient(
          this.currentUserId,
          prof.id
        );
      } else {
        // ✅ Si es cliente, crear conversación con profesional
        channel = await this.chatService.createConversationWithProfessional(
          this.currentUserId,
          prof.id
        );
      }
      
      this.closeProfessionalModal();
      await this.loadChannels();
      await this.openChannel(channel);
    } catch (error) {
      console.error('Error al crear conversación:', error);
      alert('Error al crear la conversación');
    }
  }

  // Eliminar mensajes
  openDeleteModal(message: any): void {
    this.selectedMessageToDelete = message;
    
    const modalElement = document.getElementById('deleteMessageModal');
    if (!modalElement) {
      console.error('❌ Delete modal element not found');
      return;
    }

    // ✅ Verificar si Bootstrap está disponible
    if (typeof (window as any).bootstrap !== 'undefined') {
      this.deleteModal = new (window as any).bootstrap.Modal(modalElement);
      this.deleteModal.show();
    } else {
      // ✅ Fallback: mostrar modal manualmente
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
      
      // Crear backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'deleteModalBackdrop';
      document.body.appendChild(backdrop);
    }
  }

  async deleteMessage(): Promise<void> {
    if (!this.selectedMessageToDelete) return;
    
    try {
      const client = this.chatService.getChatClient();
      await client.deleteMessage(this.selectedMessageToDelete.id);
      
      this.closeDeleteModal();
      await this.loadMessages();
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      alert('Error al eliminar el mensaje');
    }
  }

  closeDeleteModal(): void {
    const modalElement = document.getElementById('deleteMessageModal');
    
    if (this.deleteModal && typeof (window as any).bootstrap !== 'undefined') {
      this.deleteModal.hide();
    } else if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      
      const backdrop = document.getElementById('deleteModalBackdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
    
    this.selectedMessageToDelete = null;
  }

  // Scroll automático
  scrollToBottom(): void {
    const el = document.getElementById('chatContainer');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}