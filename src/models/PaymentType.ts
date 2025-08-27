import { pool } from '../config/database';
import { PaymentType } from '../types/models';

export class PaymentTypeModel {
  static async findAll(): Promise<PaymentType[]> {
    const [paymentTypes] = await pool.execute<PaymentType[]>(
      'SELECT * FROM payment_types ORDER BY name ASC'
    );
    return paymentTypes;
  }

  static async findById(id: number): Promise<PaymentType | null> {
    const [paymentTypes] = await pool.execute<PaymentType[]>(
      'SELECT * FROM payment_types WHERE id = ?',
      [id]
    );
    return paymentTypes[0] || null;
  }
}
