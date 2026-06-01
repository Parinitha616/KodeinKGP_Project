import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.resolve('./data.json');

app.use(cors());
app.use(express.json());

const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      profile: { name: 'Your Name', bio: 'Short bio...', avatar: '', accentColor: '#3b82f6' },
      links: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

app.get('/api/data', (req, res) => res.json(readData()));

app.post('/api/profile', (req, res) => {
  const data = readData();
  data.profile = { ...data.profile, ...req.body };
  writeData(data);
  res.json({ message: 'Profile updated!', profile: data.profile });
});

app.post('/api/links', (req, res) => {
  const data = readData();
  const newLink = { id: Date.now().toString(), label: 'New Link', url: 'https://', active: true, clicks: 0 };
  data.links.push(newLink);
  writeData(data);
  res.json(newLink);
});

app.put('/api/links/:id', (req, res) => {
  const data = readData();
  const index = data.links.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    data.links[index] = { ...data.links[index], ...req.body };
    writeData(data);
    return res.json(data.links[index]);
  }
  res.status(404).json({ error: 'Link not found' });
});

app.delete('/api/links/:id', (req, res) => {
  const data = readData();
  data.links = data.links.filter(l => l.id !== req.params.id);
  writeData(data);
  res.json({ message: 'Deleted!' });
});

app.post('/api/links/:id/click', (req, res) => {
  const data = readData();
  const link = data.links.find(l => l.id === req.params.id);
  if (link) { link.clicks += 1; writeData(data); return res.json(link); }
  res.status(404).json({ error: 'Link not found' });
});

app.post('/api/links/reset-stats', (req, res) => {
  const data = readData();
  data.links = data.links.map(l => ({ ...l, clicks: 0 }));
  writeData(data);
  res.json({ message: 'Stats reset!', links: data.links });
});

app.listen(PORT, () => console.log('Server running smoothly on http://localhost:5000'));
