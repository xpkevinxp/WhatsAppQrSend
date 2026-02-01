import 'dotenv/config';
import express from 'express';
import { sessionManager } from './whatsapp.js';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

const server = app.listen(PORT, async () => {
    console.log(`=========================================`);
    console.log(`🚀 Servidor Multi-Sesión escuchando en el puerto ${PORT}`);
    console.log(`🔗 Listar sesiones: http://localhost:${PORT}/sessions`);
    console.log(`=========================================`);

    // Inicializar sesiones persistentes
    console.log('Cargando sesiones previas...');
    await sessionManager.init();
});

process.on('SIGINT', async () => {
    console.log('\nCerrando servidor...');
    server.close();
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
