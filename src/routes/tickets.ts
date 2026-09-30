import { Router } from 'express';

import { insertTimeLog, getTotalHoursForTicket } from '../dal/timeLogs.js';

import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// GET /tickets
router.get('/', async (req, res) => {
  const limit =
    req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const offset =
    req.query.offset !== undefined ? Number(req.query.offset) : undefined;
  const status =
    req.query.status !== undefined ? String(req.query.status) : undefined;

  const tickets = await getAllTickets({
    limit,
    offset,
    status,
  });

  res.json(tickets);
});

// GET /tickets/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.json(ticket);
});

// POST /tickets
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  if (typeof title !== 'string' || typeof description !== 'string') {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const ticket = await createTicket({
    title,
    description,
    creator_id: res.locals.userId,
    status: 'TODO',
  });

  res.status(201).json(ticket);
});

// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (status !== 'TODO' && status !== 'IN_PROGRESS' && status !== 'DONE') {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const ticket = await updateTicketStatus(id, status);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

// TODO: Student implementation - Part 2: Time Log Routes

// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req, res) => {
  const ticketId = Number(req.params.id);
  const { hours } = req.body;

  if (typeof hours !== 'number' || hours <= 0) {
    res.status(400).json({ error: 'Invalid hours' });
    return;
  }

  const timeLog = await insertTimeLog(ticketId, res.locals.userId, hours);

  res.status(201).json(timeLog);
});

// GET /tickets/:id/time
router.get('/:id/time', async (req, res) => {
  const ticketId = Number(req.params.id);

  const totalHours = await getTotalHoursForTicket(ticketId);

  res.status(200).json({
    ticket_id: ticketId,
    total_hours: totalHours,
  });
});

export default router;
