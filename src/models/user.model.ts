import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  },
  password: { type: String, required: true }
}, {
  versionKey: false,
  _id: false
},);

const UserModel = mongoose.model('User', userSchema, 'users');

export default UserModel;

