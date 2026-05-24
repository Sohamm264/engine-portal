const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

console.log(
  'GROQ KEY LOADED:',
  process.env.GROQ_API_KEY ? 'YES ✅' : 'NO ❌'
);

const app = express();

app.use(cors());
app.use(express.json());

// ROOT FOLDER SERVE
app.use(express.static(path.join(__dirname, '..')));

// ROUTES
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));

// HEALTH
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// HOME PAGE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});