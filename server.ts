import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import split routes
import authRoutes from './backend/routes/auth.js';
import hotelRoutes from './backend/routes/hotels.js';
import reservationRoutes from './backend/routes/reservations.js';
import reviewRoutes from './backend/routes/reviews.js';
import pool from './backend/db.js';
import { initDatabase } from './backend/initDb.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  // Initialize Database
  await initDatabase();

  // --- API ROUTES ---
  app.use('/api/auth', authRoutes);
  app.use('/api/hotels', hotelRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/reviews', reviewRoutes);

  // Special manager routes (can move later too)
  app.get('/api/manager/:id/hotels', async (req, res) => {
    try {
      const [rows]: any = await pool.execute('SELECT * FROM hotels WHERE gerant_id = ?', [req.params.id]);
      const hotels = rows.map((h: any) => ({ ...h, id: String(h.id), gerant_id: String(h.gerant_id) }));
      res.json(hotels);
    } catch (err: any) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  });

  // Admin routes
  app.get('/api/admin/users', async (req, res) => {
    try {
      const [rows]: any = await pool.execute('SELECT id, nom, prenom, email, role, phone FROM users');
      const users = rows.map((u: any) => ({ ...u, id: String(u.id) }));
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  });

  app.put('/api/admin/users/:id/role', async (req, res) => {
    try {
      const { role } = req.body;
      await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
      res.json({ message: 'Rôle mis à jour' });
    } catch (err: any) {
      res.status(500).json({ message: 'Erreur', error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
  });
}

startServer();
