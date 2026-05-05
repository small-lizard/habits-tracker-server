import mongoose, { InferSchemaType, Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, default: null },
  isVerified: {
    type: Boolean,
    default: false,
  },
  blockedUntil: { type: Date, default: null },

  googleId: { type: String, default: null, sparse: true }
}, {
  versionKey: false,
},);

export type User = Omit<InferSchemaType<typeof userSchema>, 'blockedUntil' | 'googleId' | 'password'> & {
  blockedUntil: Date | null;
  googleId: string | null;
  password: string | null;
  id: string;
};

export const UserModel = mongoose.model<User>('User', userSchema);

