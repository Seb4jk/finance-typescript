import { Request, Response } from 'express';
import { TaxRateModel } from '../models/TaxRate';

export class TaxRateController {
  // Get all tax rates
  static async getTaxRates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const taxRates = await TaxRateModel.findAll();
      
      res.status(200).json({
        success: true,
        data: taxRates
      });
    } catch (error) {
      console.error('Error al obtener las tasas de impuestos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las tasas de impuestos'
      });
    }
  }

  // Get tax rate by ID
  static async getTaxRateById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de tasa de impuesto inválido'
        });
        return;
      }
      
      const taxRate = await TaxRateModel.findById(Number(id));
      
      if (!taxRate) {
        res.status(404).json({
          success: false,
          message: 'Tasa de impuesto no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: taxRate
      });
    } catch (error) {
      console.error('Error al obtener la tasa de impuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la tasa de impuesto'
      });
    }
  }

  // Get default tax rate
  static async getDefaultTaxRate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }
      
      const taxRate = await TaxRateModel.findDefault();
      
      if (!taxRate) {
        res.status(404).json({
          success: false,
          message: 'No se encontró una tasa de impuesto predeterminada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: taxRate
      });
    } catch (error) {
      console.error('Error al obtener la tasa de impuesto predeterminada:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la tasa de impuesto predeterminada'
      });
    }
  }

  // Create tax rate
  static async createTaxRate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { name, rate, description, is_default } = req.body;
      
      if (!name || rate === undefined) {
        res.status(400).json({
          success: false,
          message: 'Nombre y tasa son obligatorios'
        });
        return;
      }

      if (isNaN(Number(rate)) || Number(rate) < 0) {
        res.status(400).json({
          success: false,
          message: 'La tasa debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      
      const taxRateId = await TaxRateModel.create({
        name,
        rate: Number(rate),
        description: description || null,
        is_default: is_default || false
      });
      
      res.status(201).json({
        success: true,
        data: { id: taxRateId }
      });
    } catch (error) {
      console.error('Error al crear la tasa de impuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la tasa de impuesto'
      });
    }
  }

  // Update tax rate
  static async updateTaxRate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      const { name, rate, description, is_default } = req.body;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de tasa de impuesto inválido'
        });
        return;
      }

      // Verificar que la tasa de impuesto existe
      const existingTaxRate = await TaxRateModel.findById(Number(id));
      if (!existingTaxRate) {
        res.status(404).json({
          success: false,
          message: 'Tasa de impuesto no encontrada'
        });
        return;
      }

      if (rate !== undefined && (isNaN(Number(rate)) || Number(rate) < 0)) {
        res.status(400).json({
          success: false,
          message: 'La tasa debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      
      const updated = await TaxRateModel.update(Number(id), {
        name,
        rate: rate !== undefined ? Number(rate) : undefined,
        description,
        is_default
      });
      
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar la tasa de impuesto'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Tasa de impuesto actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar la tasa de impuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la tasa de impuesto'
      });
    }
  }

  // Delete tax rate
  static async deleteTaxRate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de tasa de impuesto inválido'
        });
        return;
      }

      // Verificar que la tasa de impuesto existe
      const existingTaxRate = await TaxRateModel.findById(Number(id));
      if (!existingTaxRate) {
        res.status(404).json({
          success: false,
          message: 'Tasa de impuesto no encontrada'
        });
        return;
      }

      // No permitir eliminar la tasa predeterminada
      if (existingTaxRate.is_default) {
        res.status(400).json({
          success: false,
          message: 'No se puede eliminar la tasa de impuesto predeterminada'
        });
        return;
      }
      
      const deleted = await TaxRateModel.delete(Number(id));
      
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'No se pudo eliminar la tasa de impuesto'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Tasa de impuesto eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar la tasa de impuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la tasa de impuesto'
      });
    }
  }
}
