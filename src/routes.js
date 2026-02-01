import express from 'express';
import { whatsapp } from './whatsapp.js';

const router = express.Router();

/**
 * Endpoint para obtener el código QR en formato imagen (HTML)
 */
router.get('/qr', async (req, res) => {
    const status = whatsapp.getStatus();
    
    if (status.isReady) {
        return res.send('<h1>WhatsApp ya está conectado y listo.</h1>');
    }

    const qrImage = await whatsapp.getQrImage();
    
    if (!qrImage) {
        return res.send('<h1>Esperando el código QR... Refresca en unos segundos.</h1>');
    }

    res.send(`
        <html>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                <h1>Escanea el QR para conectar tu WhatsApp</h1>
                <img src="${qrImage}" alt="QR Code" style="width: 300px; height: 300px; border: 1px solid #ccc; padding: 10px; border-radius: 10px;" />
                <p>Este código expira pronto. Si no funciona, refresca la página.</p>
                <script>
                    // Refrescar cada 30 segundos si no está conectado
                    setTimeout(() => location.reload(), 30000);
                </script>
            </body>
        </html>
    `);
});

/**
 * Endpoint para enviar mensajes
 * Body: { "to": "34600000000", "message": "Hola mundo" }
 */
router.post('/send-message', async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Faltan parámetros obligatorios: to y message.' 
        });
    }

    try {
        const response = await whatsapp.sendMessage(to, message);
        res.json({ 
            success: true, 
            message: 'Mensaje enviado correctamente.',
            data: {
                id: response.id.id,
                to: response.to
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * Endpoint para consultar el estado del bot
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: whatsapp.getStatus()
    });
});

export default router;
