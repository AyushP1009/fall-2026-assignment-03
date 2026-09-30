import { db } from '../db/database.js';

export interface TimeLog {
  id: number;
  ticket_id: number;
  user_id: number;
  hours: number;
  logged_at: Date;
}

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<TimeLog> {
  const timeLog = await db
    .insertInto('time_logs')
    .values({
      ticket_id: ticketId,
      user_id: userId,
      hours,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return timeLog as TimeLog;
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  const result = await db
    .selectFrom('time_logs')
    .select((eb) => eb.fn.sum<number>('hours').as('total'))
    .where('ticket_id', '=', ticketId)
    .executeTakeFirst();

  return Number(result?.total ?? 0);
}
