import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel, User } from '@models/user.model.js';
import { HabitModel, Habit } from '@models/habit.model.js';
import { UserController } from '@controllers/UserController.js';
import { HabitController } from '@controllers/HabitController.js';
import { UserRepository } from '@repositories/UserRepository.js';
import { HabitRepository } from '@repositories/HabitRepository.js';
import { MongoRepository } from '@repositories/MongoRepository.js';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import dotenv from 'dotenv';
import { requireAuth } from '@middlewares/authMiddleware.js';
dotenv.config();

const app = express();
const port = Number(process.env.PORT);
const mongoUrl = process.env.MONGO_URL as string;
const host = process.env.RENDER_EXTERNAL_URL ?? 'http://localhost';

const userRepository = new UserRepository(new MongoRepository<User>(UserModel));
const habitRepository = new HabitRepository(new MongoRepository<Habit>(HabitModel));

const userController = new UserController({
  userRepository,
  habitRepository
});

const habitController = new HabitController({ habitRepository });

app.use(cors({
  origin: 'https://habits-tracker-dev.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error('Secret not provided')
}

app.set('trust proxy', 1);

app.use(session({
  secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUrl,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 3,
    secure: true,
    httpOnly: true,
    sameSite: 'none'
  },
  rolling: true,
}))

if (!mongoUrl) {
  throw new Error('Incorrect url for MongoDB')
}

if (!host) {
  throw new Error('Incorrect host url')
}

if (!port) {
  throw new Error('Incorrect port')
}

mongoose.connect(mongoUrl)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


// USER ROUTES
app.post('/auth', userController.addUser);
app.get('/auth/check', userController.checkIsAuth);
app.post('/login', userController.login);
app.post('/logout', userController.logout);
app.put('/change-password', requireAuth, userController.changePassword);
app.delete('/delete-account', requireAuth, userController.delete);

// HABIT ROUTES
app.post('/habits/add', requireAuth, habitController.addHabit)
app.post('/habits/update', requireAuth, habitController.updateHabit)
app.delete('/habits/delete/:id', requireAuth, habitController.delete);
app.get('/habits', requireAuth, habitController.getHabits);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});