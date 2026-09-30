import { Router } from 'express';
import { getAllUsers, getUserById, createUser } from '../dal/users.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const user = await getUserById(id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

router.post('/', authMiddleware, async (req, res) => {
  const { name, email } = req.body;

  const user = await createUser({
    name,
    email,
  });

  res.status(201).json(user);
});

export default router;
