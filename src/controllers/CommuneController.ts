import { Request, Response } from 'express';
import { CommuneModel } from '../models/Commune';

export class CommuneController {
  async getCommunes(req: Request, res: Response) {
    try {
      const { region_id } = req.query;
      let communes;
      if (region_id) {
        communes = await CommuneModel.findByRegionId(Number(region_id));
      } else {
        communes = await CommuneModel.findAll();
      }
      return res.json({
        success: true,
        message: 'Comunas obtenidas exitosamente',
        data: communes
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
