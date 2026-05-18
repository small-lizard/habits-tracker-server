import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { UserModel, User } from './models/user.model';
import { HabitModel, Habit } from './models/habit.model';
import { UserController } from './controllers/UserController';
import { HabitController } from './controllers/HabitController';
import { UserRepository } from './repositories/UserRepository';
import { HabitRepository } from './repositories/HabitRepository';
import { MongoRepository } from './repositories/MongoRepository';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import dotenv from 'dotenv';
import { requireAuth } from './middlewares/authMiddleware';
import { i18nInit } from "./i18n";
import { UserService } from './services/UserService';

dotenv.config();

const port = Number(process.env.PORT);
const mongoUrl = process.env.MONGO_URL as string;
const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error('Secret not provided')
}

if (!mongoUrl) {
  throw new Error('Incorrect url for MongoDB')
}

if (!port) {
  throw new Error('Incorrect port')
}

const userRepository = new UserRepository(new MongoRepository<User>(UserModel));
const habitRepository = new HabitRepository(new MongoRepository<Habit>(HabitModel));

const userService = new UserService({ userRepository });

const userController = new UserController({
  userRepository,
  userService,
  habitRepository
});

const habitController = new HabitController({ habitRepository });

const frontURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : process.env.FRONT_URL_PROD;

const app = express();

app.use(cors({
  origin: frontURL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposedHeaders: ['Retry-After'],
}));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});

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
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'development' ? false : true,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
  },
  rolling: true,
}))

async function startServer() {
  try {

    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');

    await i18nInit();
    console.log('✅ i18next initialized');

    // USER ROUTES
    app.post('/auth', userController.addUser);
    app.post('/auth/otp', userController.sendOTP);
    app.post('/auth/google/callback', userController.googleAuthCallback);
    app.post('/verify-email', userController.verifyEmail);
    app.get('/auth/check', userController.checkIsAuth);
    app.post('/login', userController.login);
    app.post('/logout', userController.logout);
    app.put('/change-password', requireAuth(mongoose.connection), userController.changePassword);
    app.delete('/delete-account', requireAuth(mongoose.connection), userController.delete);

    // HABIT ROUTES
    app.post('/habits/add', requireAuth(mongoose.connection), habitController.addHabit)
    app.post('/habits/update', requireAuth(mongoose.connection), habitController.updateHabit)
    app.delete('/habits/delete/:id', requireAuth(mongoose.connection), habitController.delete);
    app.get('/habits', requireAuth(mongoose.connection), habitController.getHabits);

    app.get('/ping', (req, res) => res.send('ping'));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (err) {
    console.error('❌ Server start error:', err);
  }
}

startServer();