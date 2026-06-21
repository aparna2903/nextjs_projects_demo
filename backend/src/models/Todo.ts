import { Schema, model } from 'mongoose';

const todoSchema = new Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Todo = model('Todo', todoSchema);