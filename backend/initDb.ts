import mysql from 'mysql2/promise';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

export const initDatabase = async () => {
  try {
    console.log('⏳ Tentative de connexion au serveur MySQL...');
    
    // 1. First connection without specifying a database to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    const dbName = process.env.DB_NAME || 'reservehotel';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Base de données "${dbName}" vérifiée/créée`);
    await connection.end();

    // 2. Now initialize tables using the pool
    console.log('⏳ Initialisation des tables...');

    // Users Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        nom varchar(191) NOT NULL,
        prenom varchar(191) NOT NULL,
        email varchar(191) NOT NULL,
        phone varchar(20) DEFAULT NULL,
        password varchar(191) NOT NULL,
        role enum('admin','gerant','client') NOT NULL DEFAULT 'client',
        email_verified_at timestamp NULL DEFAULT NULL,
        remember_token varchar(100) DEFAULT NULL,
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY users_email_unique (email)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Hotels Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hotels (
        id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        nom varchar(191) NOT NULL,
        adresse text NOT NULL,
        latitude decimal(10,7) NOT NULL,
        longitude decimal(10,7) NOT NULL,
        description text,
        gerant_id bigint UNSIGNED NOT NULL,
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        KEY hotels_gerant_id_foreign (gerant_id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Chambres Table (Rooms)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chambres (
        id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        hotel_id bigint UNSIGNED NOT NULL,
        numero varchar(50) NOT NULL,
        type varchar(100) NOT NULL,
        prix decimal(10,2) NOT NULL,
        capacite int NOT NULL,
        statut enum('libre','occupée','maintenance') NOT NULL DEFAULT 'libre',
        description text,
        image varchar(191) DEFAULT NULL,
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY chambres_numero_unique (numero),
        KEY chambres_hotel_id_foreign (hotel_id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Reservations Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint UNSIGNED NOT NULL,
        chambre_id bigint UNSIGNED NOT NULL,
        date_arrivee date NOT NULL,
        date_depart date NOT NULL,
        statut enum('en_attente','confirmee','annulee') NOT NULL DEFAULT 'en_attente',
        demande_speciale text,
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        KEY reservations_user_id_foreign (user_id),
        KEY reservations_chambre_id_foreign (chambre_id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Avis Table (Reviews)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS avis (
        id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint UNSIGNED NOT NULL,
        chambre_id bigint UNSIGNED NOT NULL,
        note int NOT NULL,
        commentaire text,
        visible tinyint(1) NOT NULL DEFAULT '1',
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        KEY avis_user_id_foreign (user_id),
        KEY avis_chambre_id_foreign (chambre_id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Options Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS options (
        id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        nom varchar(255) NOT NULL,
        prix decimal(10,2) NOT NULL,
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Paiements Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS paiements (
        id bigint UNSIGNED NOT NULL AUTO_INCREMENT,
        reservation_id bigint UNSIGNED NOT NULL,
        montant decimal(10,2) NOT NULL,
        methode enum('cash','mobile_money','carte') NOT NULL,
        statut enum('en_attente','paye','echeoue') NOT NULL DEFAULT 'en_attente',
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        KEY paiements_reservation_id_foreign (reservation_id)
      ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Base de données initialisée avec succès (Schema SQL respecté)');
  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', err);
  }
};
