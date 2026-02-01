import 'dotenv/config';
import express from 'express';
import { whatsapp } from './whatsapp.js';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/', routes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// Inicialización del servidor
const server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Servidor API escuchando en el puerto ${PORT}`);
    console.log(`🔗 Accede a http://localhost:${PORT}/qr para el código QR`);
    console.log(`=========================================`);
});

// Inicialización de WhatsApp
console.log('Iniciando cliente de WhatsApp...');
whatsapp.initialize().catch(err => {
    console.error('Error crítico al inicializar WhatsApp:', err);
    process.exit(1);
});

// Manejo de cierre gracioso
process.on('SIGINT', async () => {
    console.log('\nCerrando servidor...');
    server.close();
    try {
        // Podrías añadir lógica aquí para cerrar el cliente de whatsapp si fuera necesario
        // await whatsapp.client.destroy();
    } catch (e) {}
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
