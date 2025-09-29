import { Request, Response } from 'express';
import { PaymentTypeModel } from '../models/PaymentType';
import { TokenPayload } from '../types/auth';

export class PaymentTypeController {
  async getPaymentTypes(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const paymentTypes = await PaymentTypeModel.findAll();
      
      return res.json(paymentTypes);
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getPaymentTypeById(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const paymentType = await PaymentTypeModel.findById(Number(id));
      
      if (!paymentType) {
        return res.status(404).json({ message: 'Tipo de pago no encontrado' });
      }
      
      return res.json(paymentType);
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
