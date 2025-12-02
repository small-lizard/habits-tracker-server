import mongoose, { InferSchemaType, Schema } from 'mongoose';

const userSchema = new Schema({
  id: { type: String, required: true },
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

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.model<User>('User', userSchema);

