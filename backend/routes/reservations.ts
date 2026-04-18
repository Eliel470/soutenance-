import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id, chambre_id, date_arrivee, date_depart, demande_speciale } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO reservations (user_id, chambre_id, date_arrivee, date_depart, statut, demande_speciale, created_at) VALUES (?, ?, ?, ?, "en_attente", ?, NOW())',
      [user_id, chambre_id, date_arrivee, date_depart, demande_speciale || null]
    );
    res.status(201).json({ id: String((result as any).insertId) });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const [rows]: any = await pool.execute(`
      SELECT r.*, h.nom as hotel_nom, h.id as hotel_id, c.type as chambre_type, c.prix as chambre_prix
      FROM reservations r
      JOIN chambres c ON r.chambre_id = c.id
      JOIN hotels h ON c.hotel_id = h.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    const reservations = rows.map((r: any) => ({ 
      ...r, 
      id: String(r.id), 
      user_id: String(r.user_id), 
      chambre_id: String(r.chambre_id),
      hotel_id: String(r.hotel_id)
    }));
    res.json(reservations);
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

router.get('/manager/:id', async (req, res) => {
  try {
    const [rows]: any = await pool.execute(`
      SELECT r.*, h.nom as hotel_nom, c.type as chambre_type, c.prix as chambre_prix, u.nom as client_nom, u.prenom as client_prenom
      FROM reservations r
      JOIN chambres c ON r.chambre_id = c.id
      JOIN hotels h ON c.hotel_id = h.id
      JOIN users u ON r.user_id = u.id
      WHERE h.gerant_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    const reservations = rows.map((r: any) => ({ 
      ...r, 
      id: String(r.id), 
      user_id: String(r.user_id), 
      chambre_id: String(r.chambre_id) 
    }));
    res.json(reservations);
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE reservations SET statut = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Statut mis à jour' });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

export default router;
