require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const profilesRoutes = require('./routes/profiles');
const medicationsRoutes = require('./routes/medications');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`MedAlert backend rodando na porta ${PORT}`));
