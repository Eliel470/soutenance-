import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get reviews for a hotel
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const [rows]: any = await pool.execute(`
      SELECT a.*, u.nom, u.prenom 
      FROM avis a
      JOIN users u ON a.user_id = u.id
      JOIN chambres c ON a.chambre_id = c.id
      WHERE c.hotel_id = ?
      ORDER BY a.created_at DESC
    `, [req.params.hotelId]);
    const reviews = rows.map((r: any) => ({ 
      ...r, 
      id: String(r.id), 
      user_id: String(r.user_id), 
      chambre_id: String(r.chambre_id) 
    }));
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

// Post a new review
router.post('/', async (req, res) => {
  try {
    const { chambre_id, user_id, note, commentaire } = req.body;
    
    // Safety check: Basic validation
    if (!chambre_id || !user_id || !note) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    const [result] = await pool.execute(
      'INSERT INTO avis (chambre_id, user_id, note, commentaire, created_at) VALUES (?, ?, ?, ?, NOW())',
      [chambre_id, user_id, note, commentaire || ""]
    );
    
    res.status(201).json({ id: String((result as any).insertId) });
  } catch (err: any) {
    res.status(500).json({ message: 'Erreur', error: err.message });
  }
});

export default router;
