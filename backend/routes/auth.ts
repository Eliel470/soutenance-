import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Auth: Register
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, password, role, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (nom, prenom, email, password, role, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nom, prenom, email, hashedPassword, role || 'client', phone || null]
    );
    
    res.status(201).json({ 
      message: 'Compte créé avec succès', 
      id: String((result as any).insertId) 
    });
  } catch (err: any) {
    console.error('Registration Error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: err.message });
  }
});

// Auth: Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: String(user.id), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;
    
    // Ensure ID is string
    userWithoutPassword.id = String(userWithoutPassword.id);
    
    res.json({ user: userWithoutPassword, token });
  } catch (err: any) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: err.message });
  }
});

// Get Profile
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const [rows]: any = await pool.execute('SELECT id, nom, prenom, email, role, phone FROM users WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const user = rows[0];
    user.id = String(user.id);
    res.json(user);
  } catch (err) {
    console.error('Profile Error:', err);
    res.status(401).json({ message: 'Token invalide' });
  }
});

export default router;
