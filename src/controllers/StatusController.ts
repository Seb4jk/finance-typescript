import { Request, Response } from 'express';
import { StatusModel } from '../models/Status';
import { TokenPayload } from '../types/auth';

export class StatusController {
  async getStatuses(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const statuses = await StatusModel.findAll();
      
      return res.json(statuses);
    } catch (error) {
      console.error('Error getting statuses:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getStatusById(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const status = await StatusModel.findById(Number(id));
      
      if (!status) {
        return res.status(404).json({ message: 'Estado no encontrado' });
      }
      
      return res.json(status);
    } catch (error) {
      console.error('Error getting status:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
