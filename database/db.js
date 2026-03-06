const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'bbbi.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema by semicolon and execute each statement
const statements = schema
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

statements.forEach((stmt) => {
  db.exec(stmt);
});

// Initialize admin user if none exists
const adminUser = db.prepare('SELECT * FROM admin_users LIMIT 1').get();
if (!adminUser) {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(
    adminUsername,
    passwordHash
  );

  console.log(`✓ Admin user created: ${adminUsername}`);
}

module.exports = db;
