# WhatsApp Multi-Session Bot API 🚀

Este bot permite gestionar **múltiples cuentas de WhatsApp** simultáneamente desde una sola instancia de Node.js.

## Características Multi-Sesión

- ✅ **Gestión de Sesiones**: Crea, lista y elimina sesiones mediante identificadores únicos (`sessionId`).
- ✅ **Aislamiento de Datos**: Cada sesión guarda su propia autenticación de forma independiente.
- ✅ **Persistencia**: Al reiniciar el servidor con PM2, el bot restaura automáticamente todas las sesiones previamente vinculadas.
- ✅ **QR Dinámico**: Acceso individual al QR de cada cuenta.

## Instalación y Uso en Linux

1. **Instalar dependencias**: `npm install`
2. **Instalar Chromium**: `apt-get install chromium-browser` (ver README anterior para dependencias de sistema).
3. **Iniciar con PM2**: `pm2 start src/index.js --name "whatsapp-multi"`

## Endpoints de la API

### 1. Crear / Inicializar Sesión
- **URL**: `/create-session/:sessionId`
- **Ejemplo**: `/create-session/ventas-01`
- **Descripción**: Prepara el motor para una nueva cuenta.

### 2. Obtener QR
- **URL**: `/qr/:sessionId`
- **Descripción**: Abre este link en tu navegador para vincular la cuenta específica.

### 3. Enviar Mensaje
- **URL**: `/send-message/:sessionId`
- **Método**: `POST`
- **Body**: `{"to": "34600000000", "message": "Hola desde sesión específica"}`

### 4. Listar Estados
- **URL**: `/sessions`
- **Descripción**: Devuelve un JSON con el estado (`isReady`, `hasQr`) de todas las sesiones activas.

### 5. Eliminar Sesión
- **URL**: `/session/:sessionId`
- **Método**: `DELETE`
- **Descripción**: Cierra la sesión, destruye el cliente y elimina los datos locales.

## Estructura de Persistencia
Los datos se guardan en `.wwebjs_auth/session-ID`. **No borres esta carpeta** si quieres mantener las sesiones activas tras un reinicio.
