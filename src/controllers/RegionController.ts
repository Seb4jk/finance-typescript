import { Request, Response } from 'express';
import { RegionModel } from '../models/Region';

export class RegionController {
  async getRegions(req: Request, res: Response) {
    try {
      const regions = await RegionModel.findAll();
      return res.json({
        success: true,
        message: 'Regiones obtenidas exitosamente',
        data: regions
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
