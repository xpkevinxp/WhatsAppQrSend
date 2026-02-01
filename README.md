# WhatsApp Multi-Session Bot API con Anti-Ban 🚀

Este bot profesional permite gestionar **múltiples cuentas de WhatsApp** simultáneamente con una arquitectura robusta diseñada para evitar bloqueos y baneos.

## Características Principales

- ✅ **Multi-Sesión**: Crea y gestiona múltiples cuentas independientes (`sessionId`).
- ✅ **Estrategia Anti-Ban Pro**:
  - **Cola de Mensajes (FIFO)**: Los envíos masivos se procesan secuencialmente.
  - **Simulación de Escritura**: Activa el estado "Escribiendo..." antes de cada envío.
  - **Retrasos Aleatorios**: Intervalos humanos entre mensajes (5-15 segundos) para evitar patrones robóticos.
- ✅ **Persistencia Total**: Las sesiones se restauran automáticamente al reiniciar el servidor.
- ✅ **Optimizado para Linux**: Configuración lista para servidores (Chromium headless + PM2).

## Instalación en Linux

1. **Dependencias de Node**: `npm install`
2. **Navegador y Librerías de Sistema**:
   ```bash
   apt-get update && apt-get install -y chromium-browser libnss3 libatk-bridge2.0-0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 libxshmfence1 libx11-xcb1
   ```
3. **Configurar PM2 para Autoinicio**:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name "whatsapp-bot"
   pm2 startup  # Sigue las instrucciones que imprima este comando
   pm2 save
   ```

## Referencia de la API

### 1. Gestión de Sesiones
- **Crear Sesión**: `GET /create-session/:sessionId` (Prepara el motor para una cuenta).
- **Ver QR**: `GET /qr/:sessionId` (Escanea para vincular).
- **Listar Estados**: `GET /sessions` (Muestra cuentas activas y longitud de colas).
- **Eliminar Sesión**: `DELETE /session/:sessionId` (Cierra y borra datos).

### 2. Enviar Mensajes (Con Anti-Ban)
- **Endpoint**: `POST /send-message/:sessionId`
- **Cuerpo (JSON)**:
  ```json
  {
    "to": "34600000000",
    "message": "Hola, este mensaje pasará por la cola de seguridad."
  }
  ```
- **Funcionamiento**: El mensaje se encola. El bot simulará que escribe por unos segundos y luego lo enviará, esperando un tiempo prudencial antes de pasar al siguiente mensaje de la cola.

## Monitoreo
Para ver qué está haciendo el bot en tiempo real (especialmente los logs de envío y el QR en consola):
```bash
pm2 logs whatsapp-bot
```

## Estructura de Datos
- `.wwebjs_auth/`: Contiene las sesiones persistentes.
- `src/whatsapp.js`: Motor de WhatsApp y lógica de colas.
- `src/routes.js`: Definición de la API REST.
