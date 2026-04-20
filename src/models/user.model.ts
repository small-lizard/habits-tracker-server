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
  password: { type: String, required: true },
  isVerified: {
    type: Boolean,
    default: false,
  },
  blockedUntil: { type: Date, default: null }
}, {
  versionKey: false,
},);

export type User = Omit<InferSchemaType<typeof userSchema>, 'blockedUntil'> & {
  blockedUntil: Date | null
};

export const UserModel = mongoose.model<User>('User', userSchema);

