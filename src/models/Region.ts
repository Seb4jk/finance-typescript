import { pool } from '../config/database';
import { Region } from '../types/models';

export class RegionModel {
  static async findAll(): Promise<Region[]> {
    const [regions] = await pool.execute<Region[]>('SELECT * FROM regions ORDER BY id ASC');
    return regions;
  }
}
