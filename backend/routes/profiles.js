const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const profiles = db.prepare(
    'SELECT id, name, relation FROM profiles WHERE user_id = ?'
  ).all(req.user.id);
  res.json(profiles);
});

router.post('/', (req, res) => {
  const { name, relation } = req.body;
  if (!name || !relation) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, relation' });
  }
  const result = db.prepare(
    'INSERT INTO profiles (user_id, name, relation) VALUES (?, ?, ?)'
  ).run(req.user.id, name, relation);
  res.status(201).json({ id: result.lastInsertRowid, name, relation });
});

router.delete('/:id', (req, res) => {
  const profile = db.prepare(
    'SELECT id FROM profiles WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  db.prepare('DELETE FROM profiles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
