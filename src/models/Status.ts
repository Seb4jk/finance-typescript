import { pool } from '../config/database';
import { Status } from '../types/models';

export class StatusModel {
  static async findAll(): Promise<Status[]> {
    const [statuses] = await pool.execute<Status[]>(
      'SELECT * FROM status ORDER BY name ASC'
    );
    return statuses;
  }

  static async findById(id: number): Promise<Status | null> {
    const [statuses] = await pool.execute<Status[]>(
      'SELECT * FROM status WHERE id = ?',
      [id]
    );
    return statuses[0] || null;
  }
}
