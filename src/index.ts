import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import UserModel from './models/user.model';
import UserController from './controllers/UserController';
import UserRepository, { User } from './repositories/UserRepository';
import MongoRepository from './repositories/MongoRepository';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 5000;
const userRepository = new UserRepository(new MongoRepository<User>(UserModel));
const userController = new UserController({ userRepository });

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error('Secret not provided')
}

app.use(session({
  secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/test',
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  },
  rolling: true,
}))

mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.post('/auth', userController.addUser);

app.post('/login', userController.login);

app.post('/logout', userController.logout);

app.put('/change-password', userController.changePassword);

app.delete('/delete-account', userController.delete);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


