import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

class WhatsappClient {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: sessionId,
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
                executablePath: process.platform === 'linux' ? '/usr/bin/chromium-browser' : undefined
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
            console.log(`--- [${this.sessionId}] NUEVO CÓDIGO QR RECIBIDO ---`);
            qrcodeTerminal.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.isReady = true;
            this.qrCode = null;
            console.log(`¡[${this.sessionId}] CLIENTE LISTO!`);
        });

        this.client.on('authenticated', () => {
            console.log(`[${this.sessionId}] Sesión autenticada.`);
        });

        this.client.on('auth_failure', (msg) => {
            console.error(`[${this.sessionId}] ERROR DE AUTENTICACIÓN:`, msg);
            this.isReady = false;
        });

        this.client.on('disconnected', async (reason) => {
            console.log(`[${this.sessionId}] CLIENTE DESCONECTADO:`, reason);
            this.isReady = false;
            this.qrCode = null;
            
            try {
                await this.client.destroy();
                console.log(`[${this.sessionId}] Reiniciando cliente...`);
                setTimeout(() => {
                    this.client.initialize().catch(err => console.error(`[${this.sessionId}] Error al reiniciar:`, err));
                }, 5000);
            } catch (err) {
                console.error(`[${this.sessionId}] Error al destruir cliente:`, err);
            }
        });
    }

    async getQrImage() {
        if (!this.qrCode) return null;
        return await qrcode.toDataURL(this.qrCode);
    }

    async sendMessage(to, message) {
        if (!this.isReady) {
            throw new Error('El cliente no está listo. Escanea el QR primero.');
        }

        try {
            const formattedNumber = to.includes('@c.us') ? to : `${to.replace(/\D/g, '')}@c.us`;
            return await this.client.sendMessage(formattedNumber, message);
        } catch (error) {
            console.error(`[${this.sessionId}] Error al enviar mensaje:`, error);
            throw error;
        }
    }

    initialize() {
        return this.client.initialize();
    }

    getStatus() {
        return {
            sessionId: this.sessionId,
            isReady: this.isReady,
            hasQr: !!this.qrCode
        };
    }

    async logout() {
        try {
            await this.client.logout();
            await this.client.destroy();
            return true;
        } catch (error) {
            console.error(`[${this.sessionId}] Error al cerrar sesión:`, error);
            return false;
        }
    }
}

class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.authPath = './.wwebjs_auth';
    }

    async init() {
        // Cargar sesiones existentes de la carpeta .wwebjs_auth
        if (!fs.existsSync(this.authPath)) {
            fs.mkdirSync(this.authPath, { recursive: true });
            return;
        }

        const dirs = fs.readdirSync(this.authPath);
        for (const dir of dirs) {
            if (dir.startsWith('session-')) {
                const sessionId = dir.replace('session-', '');
                console.log(`Restaurando sesión: ${sessionId}`);
                await this.createSession(sessionId);
            }
        }
    }

    async createSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }

        const client = new WhatsappClient(sessionId);
        this.sessions.set(sessionId, client);
        client.initialize().catch(err => console.error(`Error inicializando ${sessionId}:`, err));
        return client;
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    async deleteSession(sessionId) {
        const client = this.sessions.get(sessionId);
        if (client) {
            await client.logout();
            this.sessions.delete(sessionId);
            // Opcional: eliminar carpeta de sesión físicamente
            const sessionPath = path.join(this.authPath, `session-${sessionId}`);
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            return true;
        }
        return false;
    }

    getAllStatuses() {
        const statuses = [];
        for (const client of this.sessions.values()) {
            statuses.push(client.getStatus());
        }
        return statuses;
    }
}

export const sessionManager = new SessionManager();
