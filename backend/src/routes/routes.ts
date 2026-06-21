import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todoController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/todos', authenticate, getTodos);
router.post('/todos', authenticate, createTodo);
router.put('/todos/:id', authenticate, updateTodo);
router.delete('/todos/:id', authenticate, deleteTodo);

export default router;