import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StreamChat, Channel } from 'stream-chat';
import { environment } from '../../../../environments/environment';
import { SolicitudRepository } from '../../../domain/solicitudes/solicitud.repository';

@Injectable({
  providedIn: 'root'
})
export class StreamChatService {
  private chatClient!: StreamChat;
  private currentUserId: string = '';
  private http = inject(HttpClient);
  private solicitudRepository = inject(SolicitudRepository);
  private isProfessional: boolean = false; // ✅ Nuevo: guardar si es profesional
  private realUserId: string = ''; // ✅ Nuevo: ID real del usuario (no el del profesional)

  get userId(): string {
    return this.currentUserId;
  }

  async initializeChat(
    userId: string, 
    userName: string, 
    isProfessional: boolean = false,
    realUserId?: string
  ): Promise<StreamChat> {
    try {
      this.isProfessional = isProfessional;
      this.realUserId = realUserId || userId;

      const initData = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/v1/chat/init?userId=${userId}`)
      );

      console.log('📥 Datos de inicialización:', initData);

      this.chatClient = StreamChat.getInstance(initData.apiKey);

      const fullName = initData.fullName || userName;
      await this.chatClient.connectUser(
        {
          id: userId,
          name: fullName,
        },
        initData.token
      );

      this.currentUserId = userId;
      console.log('✅ Chat inicializado con nombre:', fullName);
      
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

  async getUserChannels(): Promise<Channel[]> {
    if (!this.chatClient) {
      console.error('❌ Chat client no inicializado');
      return [];
    }

    try {
      const filter = { members: { $in: [this.currentUserId] } };
      const sort = [{ last_message_at: -1 as const }];
      
      const channels = await this.chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });

      console.log('✅ Canales obtenidos:', channels.length);
      return channels;
    } catch (error) {
      console.error('❌ Error al obtener canales:', error);
      return [];
    }
  }

  async createConversationWithProfessional(
    userId: string,
    professionalId: string
  ): Promise<Channel> {
    try {
      console.log('📤 Creando conversación:', { userId, professionalId });
      
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/v1/chat/conversations/with-professional`, {
          userId,
          professionalId
        })
      );

      console.log('📥 Respuesta del backend:', response);

      const channel = this.chatClient.channel(
        response.channelType,
        response.channelId
      );

      await channel.watch();
      
      console.log('✅ Canal creado:', {
        id: channel.id,
        type: channel.type,
        members: Object.keys(channel.state.members)
      });
      
      return channel;
    } catch (error) {
      console.error('❌ Error al crear conversación:', error);
      throw error;
    }
  }

  async getProfessionals(): Promise<any[]> {
    // ✅ Si es profesional, retornar array vacío sin hacer la llamada
    if (this.isProfessional) {
      console.log('⚠️ Usuario es profesional, no puede ver lista de profesionales');
      return [];
    }

    try {
      // ✅ Usar realUserId en lugar de currentUserId
      const userIdForRequest = this.realUserId || this.currentUserId;
      
      console.log('🔍 Obteniendo solicitudes para usuario:', userIdForRequest);
      
      const solicitudes = await firstValueFrom(
        this.solicitudRepository.getSolicitudesByUsuario(parseInt(userIdForRequest))
      );

      console.log('✅ Solicitudes del usuario:', solicitudes);

      return solicitudes.map(solicitud => ({
        id: solicitud.idProfesional.toString(),
        name: `${solicitud.nombreProfesional} ${solicitud.apellidoProfesional}`,
        specialty: solicitud.especialidad || 'Sin especialidad',
        imagenUrl: solicitud.imagenUrl,
        solicitudId: solicitud.idSolicitud,
        estado: solicitud.estado
      }));
    } catch (error: any) {
      console.error('❌ Error al obtener profesionales:', error);
      
      if (error?.status === 403) {
        console.log('⚠️ Usuario sin permisos para ver solicitudes');
        return [];
      }
      
      return [];
    }
  }

  async disconnectUser(): Promise<void> {
    if (this.chatClient) {
      await this.chatClient.disconnectUser();
    }
  }
}