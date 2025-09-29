import { pool } from '../config/database';
import { Commune } from '../types/models';

export class CommuneModel {
  static async findAll(): Promise<Commune[]> {
    const [communes] = await pool.execute<Commune[]>('SELECT id, name FROM communes ORDER BY id ASC');
    return communes;
  }
  static async findByRegionId(region_id: number): Promise<Commune[]> {
    const [communes] = await pool.execute<Commune[]>('SELECT id, name FROM communes WHERE region_id = ? ORDER BY id ASC', [region_id]);
    return communes;
  }
}
