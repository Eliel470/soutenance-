import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM hotels');
    const hotels = rows.map((h: any) => ({ ...h, id: String(h.id), gerant_id: String(h.gerant_id) }));
    res.json(hotels);
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Hôtel non trouvé' });
    const hotel = rows[0];
    hotel.id = String(hotel.id);
    hotel.gerant_id = String(hotel.gerant_id);
    res.json(hotel);
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

router.get('/:id/rooms', async (req, res) => {
  try {
    const { checkin, checkout } = req.query;
    
    let query = 'SELECT * FROM chambres WHERE hotel_id = ?';
    let params: any[] = [req.params.id];

    if (checkin && checkout) {
      // Logic: Select rooms that DO NOT have overlapping reservations
      query = `
        SELECT * FROM chambres 
        WHERE hotel_id = ? 
        AND id NOT IN (
          SELECT chambre_id FROM reservations 
          WHERE statut != 'annulee'
          AND (
            (date_arrivee < ? AND date_depart > ?)
          )
        )
      `;
      params = [req.params.id, checkout, checkin];
    }

    const [rows]: any = await pool.execute(query, params);
    const rooms = rows.map((r: any) => ({ ...r, id: String(r.id), hotel_id: String(r.hotel_id) }));
    res.json(rooms);
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

router.post('/:id/rooms', async (req, res) => {
  try {
    const { numero, type, prix, capacite, description, statut } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO chambres (hotel_id, numero, type, prix, capacite, description, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, numero, type, prix, capacite, description, statut || 'libre']
    );
    res.status(201).json({ id: String((result as any).insertId) });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la chambre', error: err.message });
  }
});

router.put('/rooms/:roomId', async (req, res) => {
  try {
    const { numero, type, prix, capacite, description, statut } = req.body;
    await pool.execute(
      'UPDATE chambres SET numero = ?, type = ?, prix = ?, capacite = ?, description = ?, statut = ? WHERE id = ?',
      [numero, type, prix, capacite, description, statut, req.params.roomId]
    );
    res.json({ message: 'Chambre mise à jour' });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur lors de la modification', error: err.message });
  }
});

router.delete('/rooms/:roomId', async (req, res) => {
  try {
    await pool.execute('DELETE FROM chambres WHERE id = ?', [req.params.roomId]);
    res.json({ message: 'Chambre supprimée' });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nom, adresse, latitude, longitude, description, gerant_id } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO hotels (nom, adresse, latitude, longitude, description, gerant_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nom, adresse, latitude, longitude, description, gerant_id]
    );
    res.status(201).json({ id: String((result as any).insertId) });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

export default router;
