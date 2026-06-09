const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const parseMed = (row) => ({
  id: row.id,
  profileId: row.profile_id,
  name: row.name,
  dosage: row.dosage,
  schedule: JSON.parse(row.schedule),
  duration: JSON.parse(row.duration),
  startDate: row.start_date,
  notes: row.notes,
  info: row.info,
  doses: JSON.parse(row.doses),
  history: [],
});

router.get('/', (req, res) => {
  const meds = db.prepare(`
    SELECT m.* FROM medications m
    JOIN profiles p ON m.profile_id = p.id
    WHERE p.user_id = ?
  `).all(req.user.id);
  res.json(meds.map(parseMed));
});

router.post('/', (req, res) => {
  const { profileId, name, dosage, schedule, duration, startDate, notes, info, doses } = req.body;
  const profile = db.prepare(
    'SELECT id FROM profiles WHERE id = ? AND user_id = ?'
  ).get(profileId, req.user.id);
  if (!profile) return res.status(403).json({ error: 'Perfil não autorizado' });

  const result = db.prepare(`
    INSERT INTO medications (profile_id, name, dosage, schedule, duration, start_date, notes, info, doses)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileId, name, dosage,
    JSON.stringify(schedule), JSON.stringify(duration),
    startDate || null, notes || null, info || null,
    JSON.stringify(doses || schedule?.times || [])
  );

  res.status(201).json(parseMed({
    id: result.lastInsertRowid,
    profile_id: profileId, name, dosage,
    schedule: JSON.stringify(schedule),
    duration: JSON.stringify(duration),
    start_date: startDate || null,
    notes: notes || null,
    info: info || null,
    doses: JSON.stringify(doses || schedule?.times || []),
  }));
});

router.put('/:id', (req, res) => {
  const med = db.prepare(`
    SELECT m.id FROM medications m
    JOIN profiles p ON m.profile_id = p.id
    WHERE m.id = ? AND p.user_id = ?
  `).get(req.params.id, req.user.id);
  if (!med) return res.status(404).json({ error: 'Medicamento não encontrado' });

  const { name, dosage, schedule, duration, startDate, notes, info, doses } = req.body;
  db.prepare(`
    UPDATE medications SET name=?, dosage=?, schedule=?, duration=?, start_date=?, notes=?, info=?, doses=?
    WHERE id=?
  `).run(
    name, dosage,
    JSON.stringify(schedule), JSON.stringify(duration),
    startDate || null, notes || null, info || null,
    JSON.stringify(doses || schedule?.times || []),
    req.params.id
  );
  res.json({ ...req.body, id: parseInt(req.params.id), history: [] });
});

router.delete('/:id', (req, res) => {
  const med = db.prepare(`
    SELECT m.id FROM medications m
    JOIN profiles p ON m.profile_id = p.id
    WHERE m.id = ? AND p.user_id = ?
  `).get(req.params.id, req.user.id);
  if (!med) return res.status(404).json({ error: 'Medicamento não encontrado' });
  db.prepare('DELETE FROM medications WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
