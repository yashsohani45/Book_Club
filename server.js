const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/book-club', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Define schemas
const bookClubSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const discussionSchema = new mongoose.Schema({
  clubId: String,
  message: String,
  user: String,
  timestamp: { type: Date, default: Date.now },
});

const meetingSchema = new mongoose.Schema({
  clubId: String,
  title: String,
  date: Date,
  description: String,
});

// Create models
const BookClub = mongoose.model('BookClub', bookClubSchema);
const Discussion = mongoose.model('Discussion', discussionSchema);
const Meeting = mongoose.model('Meeting', meetingSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Book Club Platform Backend');
});

// Book Club Routes
app.post('/create-club', async (req, res) => {
  const { name, description } = req.body;
  const club = new BookClub({ name, description });
  await club.save();
  res.send('Book club created');
});

app.get('/clubs', async (req, res) => {
  const clubs = await BookClub.find();
  res.send(clubs);
});

// Discussion Routes
app.post('/post-discussion', async (req, res) => {
  const { clubId, message, user } = req.body;
  const discussion = new Discussion({ clubId, message, user });
  await discussion.save();
  res.send('Discussion posted');
});

app.get('/discussions/:clubId', async (req, res) => {
  const discussions = await Discussion.find({ clubId: req.params.clubId });
  res.send(discussions);
});

// Meeting Routes
app.post('/schedule-meeting', async (req, res) => {
  const { clubId, title, date, description } = req.body;
  const meeting = new Meeting({ clubId, title, date, description });
  await meeting.save();
  res.send('Meeting scheduled');
});

app.get('/meetings/:clubId', async (req, res) => {
  const meetings = await Meeting.find({ clubId: req.params.clubId });
  res.send(meetings);
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});