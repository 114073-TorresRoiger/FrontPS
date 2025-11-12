export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com', // URL de producción
  streamChat: {
    apiKey: 'YOUR_PRODUCTION_STREAM_API_KEY', // ⚠️ Usar variable de entorno en CI/CD
    apiUrl: 'https://your-production-api.com/api/v1/chat'
  }
};
