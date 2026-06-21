import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Todo } from '../models/Todo';
import { z } from 'zod';

const todoSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean().optional(),
});

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const rawTodos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
    const todos = rawTodos.map(todo => ({
      id: todo._id,
      title: todo.title,
      completed: todo.completed,
    }));
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = todoSchema.parse(req.body);
    const todo = await Todo.create({ title, userId: req.userId });
    res.status(201).json({ id: todo._id, title: todo.title, completed: todo.completed });
  } catch (error) {
    res.status(400).json({ message: 'Invalid payload structure' });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, completed } = todoSchema.partial().parse(req.body);

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { ...(title && { title }), ...(completed !== undefined && { completed }) },
      { new: true }
    );

    if (!updatedTodo) {
      res.status(404).json({ message: 'Todo item not found' });
      return;
    }

    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Update execution failed' });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Todo.deleteOne({ _id: id, userId: req.userId });
    
    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Todo item not found' });
      return;
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion execution failed' });
  }
};