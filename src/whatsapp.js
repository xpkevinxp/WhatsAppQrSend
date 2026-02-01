import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';

class WhatsappClient {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'whatsapp-bot',
                dataPath: './.wwebjs_auth'
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ],
                // En Linux a veces es necesario especificar la ruta del ejecutable de Chrome/Chromium
                // executablePath: '/usr/bin/google-chrome-stable' 
            }
        });

        this.qrCode = null;
        this.isReady = false;

        this.initializeEvents();
    }

    initializeEvents() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            this.isReady = false;
            console.log('--- NUEVO CÓDIGO QR RECIBIDO ---');
            qrcodeTerminal.generate(qr, { small: true });
            console.log('Escanea el QR arriba o usa el endpoint /qr para conectarte.');
        });

        this.client.on('ready', () => {
            this.isReady = true;
            this.qrCode = null;
            console.log('¡CLIENTE LISTO! El bot de WhatsApp está conectado.');
        });

        this.client.on('authenticated', () => {
            console.log('Sesión autenticada correctamente.');
        });

        this.client.on('auth_failure', (msg) => {
            console.error('ERROR DE AUTENTICACIÓN:', msg);
            this.isReady = false;
            console.log('Sugerencia: Si el error persiste, elimina la carpeta .wwebjs_auth y reinicia.');
        });

        this.client.on('disconnected', async (reason) => {
            console.log('CLIENTE DESCONECTADO:', reason);
            this.isReady = false;
            this.qrCode = null;
            
            // Intentar destruir y reiniciar el cliente para una reconexión limpia
            try {
                await this.client.destroy();
                console.log('Reiniciando cliente para reconexión...');
                setTimeout(() => {
                    this.client.initialize().catch(err => console.error('Error al reintentar inicialización:', err));
                }, 5000);
            } catch (err) {
                console.error('Error al destruir cliente durante desconexión:', err);
            }
        });
    }

    async getQrImage() {
        if (!this.qrCode) return null;
        return await qrcode.toDataURL(this.qrCode);
    }

    async sendMessage(to, message) {
        if (!this.isReady) {
            throw new Error('El cliente no está listo. Por favor, escanea el código QR.');
        }

        try {
            // Asegurarse de que el formato del número sea correcto (ej: 34600000000@c.us)
            const formattedNumber = to.includes('@c.us') ? to : `${to.replace(/\D/g, '')}@c.us`;
            const response = await this.client.sendMessage(formattedNumber, message);
            return response;
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            throw error;
        }
    }

    initialize() {
        return this.client.initialize();
    }

    getStatus() {
        return {
            isReady: this.isReady,
            hasQr: !!this.qrCode
        };
    }
}

export const whatsapp = new WhatsappClient();
