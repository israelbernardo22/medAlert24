const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const entries = db.prepare(`
    SELECT h.* FROM history h
    JOIN medications m ON h.medication_id = m.id
    JOIN profiles p ON m.profile_id = p.id
    WHERE p.user_id = ?
    ORDER BY h.date DESC, h.scheduled_time DESC
  `).all(req.user.id);

  res.json(entries.map(e => ({
    id: e.id,
    medicationId: e.medication_id,
    date: e.date,
    scheduledTime: e.scheduled_time,
    status: e.status,
    takenAt: e.taken_at,
  })));
});

router.post('/', (req, res) => {
  const { medicationId, date, scheduledTime, status, takenAt } = req.body;
  const med = db.prepare(`
    SELECT m.id FROM medications m
    JOIN profiles p ON m.profile_id = p.id
    WHERE m.id = ? AND p.user_id = ?
  `).get(medicationId, req.user.id);
  if (!med) return res.status(403).json({ error: 'Medicamento não autorizado' });

  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO history (medication_id, date, scheduled_time, status, taken_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(medicationId, date || now.split('T')[0], scheduledTime, status, takenAt || now);

  res.status(201).json({
    id: result.lastInsertRowid,
    medicationId,
    date: date || now.split('T')[0],
    scheduledTime,
    status,
    takenAt: takenAt || now,
  });
});

module.exports = router;
