import express from 'express';
import { sessionManager } from './whatsapp.js';

const router = express.Router();

/**
 * Endpoint para crear una nueva sesión
 */
router.get('/create-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        await sessionManager.createSession(sessionId);
        res.json({ success: true, message: `Sesión ${sessionId} inicializada.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Endpoint para obtener el código QR de una sesión específica
 */
router.get('/qr/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
        return res.status(404).send('<h1>Sesión no encontrada.</h1>');
    }

    const status = session.getStatus();
    if (status.isReady) {
        return res.send(`<h1>WhatsApp (${sessionId}) ya está conectado.</h1>`);
    }

    const qrImage = await session.getQrImage();
    if (!qrImage) {
        return res.send('<h1>Esperando el código QR... Refresca en unos segundos.</h1>');
    }

    res.send(`
        <html>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                <h1>Escanea el QR para la sesión: ${sessionId}</h1>
                <img src="${qrImage}" alt="QR Code" style="width: 300px; height: 300px; border: 1px solid #ccc; padding: 10px; border-radius: 10px;" />
                <script>setTimeout(() => location.reload(), 30000);</script>
            </body>
        </html>
    `);
});

/**
 * Endpoint para enviar mensajes desde una sesión específica
 */
router.post('/send-message/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { to, message, pdfBase64, caption } = req.body;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
        return res.status(404).json({ success: false, error: 'Sesión no encontrada.' });
    }

    if (!to || (!message && !pdfBase64)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Faltan parámetros: se requiere "to" y al menos "message" o "pdfBase64".' 
        });
    }

    try {
        // Ahora pasamos también pdfBase64 y caption
        session.enqueueMessage(to, message, pdfBase64, caption); 
        
        res.json({ 
            success: true, 
            message: pdfBase64 ? 'Archivo PDF encolado para envío.' : 'Mensaje encolado para envío.',
            data: { 
                to,
                sessionId,
                hasMedia: !!pdfBase64,
                queuePosition: session.getStatus().queueLength 
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Listar todas las sesiones y sus estados
 */
router.get('/sessions', (req, res) => {
    res.json({
        success: true,
        sessions: sessionManager.getAllStatuses()
    });
});

/**
 * Eliminar una sesión
 */
router.delete('/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const deleted = await sessionManager.deleteSession(sessionId);
    res.json({ success: deleted });
});

export default router;
