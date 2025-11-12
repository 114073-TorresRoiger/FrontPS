import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StreamChat, Channel } from 'stream-chat';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StreamChatService {
  private chatClient!: StreamChat;
  private currentUserId: string = '';

  constructor(private http: HttpClient) {}

  async initializeChat(userId: string, userName: string): Promise<StreamChat> {
    try {
      // 1. Obtener API Key y Token desde tu backend
      const initData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/v1/chat/init?userId=${userId}`)
      );

      // 2. Crear instancia de Stream Chat
      this.chatClient = StreamChat.getInstance(initData.apiKey);

      // 3. Conectar usuario
      await this.chatClient.connectUser(
        {
          id: userId,
          name: userName,
        },
        initData.token
      );

      this.currentUserId = userId;
      console.log('✅ Chat inicializado correctamente');
      
      return this.chatClient;
    } catch (error) {
      console.error('❌ Error al inicializar chat:', error);
      throw error;
    }
  }

  getChatClient(): StreamChat {
    return this.chatClient;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  async createConversationWithProfessional(
    userId: string,
    professionalId: string
  ): Promise<Channel> {
    try {
      // Llamar a tu endpoint para crear la conversación
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/v1/chat/conversations/with-professional`, {
          userId,
          professionalId
        })
      );

      // Obtener el canal creado
      const channel = this.chatClient.channel(
        response.channelType,
        response.channelId
      );

      await channel.watch();
      
      return channel;
    } catch (error) {
      console.error('❌ Error al crear conversación:', error);
      throw error;
    }
  }

  async getProfessionals(): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.http.get<any[]>(`${environment.apiUrl}/api/v1/chat/professionals/available`)
      );
    } catch (error) {
      console.error('❌ Error al obtener profesionales:', error);
      return [];
    }
  }

  async disconnectUser(): Promise<void> {
    if (this.chatClient) {
      await this.chatClient.disconnectUser();
    }
  }
}
