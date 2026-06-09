const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'medalert_secret';

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, email, password' });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).run(name, email, hash);
    const user = { id: result.lastInsertRowid, name, email };
    const token = jwt.sign({ id: user.id, email }, SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }
  const token = jwt.sign({ id: user.id, email }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
