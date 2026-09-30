import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Log Tests', () => {
  it('adds time logs and returns the correct total hours', async () => {
    // Create a user first
    const userResponse = await request(app)
      .post('/users')
      .set('X-User-Id', '1')
      .send({
        name: 'Time Log Test User',
        email: `timelog${Date.now()}@example.com`,
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id;

    // Create a ticket using that user's ID
    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Time Log Test Ticket',
        description: 'Testing time logs',
      });

    expect(ticketResponse.status).toBe(201);

    const ticketId = ticketResponse.body.id;

    // Add 2 hours
    const firstLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({
        hours: 2,
      });

    expect(firstLog.status).toBe(201);

    // Add 3 hours
    const secondLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({
        hours: 3,
      });

    expect(secondLog.status).toBe(201);

    // Check total
    const totalResponse = await request(app).get(`/tickets/${ticketId}/time`);

    expect(totalResponse.status).toBe(200);
    expect(totalResponse.body.ticket_id).toBe(ticketId);
    expect(totalResponse.body.total_hours).toBe(5);
  });
});
