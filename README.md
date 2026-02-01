# WhatsApp QR Bot API 🚀

Este proyecto es una implementación profesional de un bot de WhatsApp utilizando la librería `whatsapp-web.js`. Permite conectar una cuenta de WhatsApp escaneando un código QR y expone una API REST para enviar mensajes programáticamente.

## Características

- ✅ **Persistencia de Sesión**: Utiliza `LocalAuth` para mantener la conexión tras reiniciar el servidor.
- ✅ **API REST**: Endpoints listos para enviar mensajes y consultar el estado.
- ✅ **Visualización de QR**: Acceso al código QR vía terminal o mediante una página web dedicada.
- ✅ **Optimizado para Linux**: Configuración de Puppeteer lista para entornos de servidor.
- ✅ **Robustez**: Manejo automático de reconexiones y errores.

## Instalación

1.  **Clonar el repositorio** (o descargar los archivos).
2.  **Instalar dependencias**:
    ```bash
    npm install
    ```
3.  **Configurar el entorno**:
    Crea un archivo `.env` (o usa el existente) y define el puerto:
    ```env
    PORT=3000
    ```

### Dependencias adicionales en Linux (Importante)
Para que Puppeteer funcione correctamente en Linux, asegúrate de tener instaladas las dependencias de Chromium:
```bash
sudo apt-get update && sudo apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    libx11-xcb1
```

## Uso

### Iniciar el bot
- Modo producción: `npm start`
- Modo desarrollo: `npm run dev`

### Pasos para conectar
1. Inicia el servidor.
2. Abre tu navegador en `http://localhost:3000/qr`.
3. Escanea el código QR con tu aplicación de WhatsApp (Dispositivos vinculados).
4. Una vez conectado, verás el mensaje `¡CLIENTE LISTO!` en la terminal.

## Referencia de la API

### 1. Ver QR / Estado de conexión
- **URL**: `/qr`
- **Método**: `GET`
- **Descripción**: Muestra el código QR si no está conectado, o un mensaje de confirmación si ya lo está.

### 2. Enviar Mensaje
- **URL**: `/send-message`
- **Método**: `POST`
- **Cuerpo (JSON)**:
  ```json
  {
    "to": "34600000000",
    "message": "Hola, este es un mensaje desde el bot profesional."
  }
  ```
- **Nota**: El número debe incluir el prefijo internacional sin el signo `+`.

### 3. Consultar Estado
- **URL**: `/status`
- **Método**: `GET`
- **Descripción**: Devuelve un JSON con el estado actual del bot.

## Estructura del Proyecto

- `src/index.js`: Punto de entrada, configuración de Express.
- `src/whatsapp.js`: Lógica principal del cliente de WhatsApp y eventos.
- `src/routes.js`: Definición de los endpoints de la API.
- `.wwebjs_auth/`: Carpeta (generada) donde se guarda la sesión local.

## Notas de Seguridad
WhatsApp no permite oficialmente bots en cuentas personales. El uso de esta librería conlleva un riesgo de baneo si se abusa del envío masivo de mensajes o spam. Se recomienda un uso responsable.
