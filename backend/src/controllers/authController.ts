import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = authSchema.parse(req.body);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Validation Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = authSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Validation Error' });
  }
};