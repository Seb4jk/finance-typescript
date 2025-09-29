import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category';
import { TokenPayload } from '../types/auth';
import { TransactionModel } from '../models/Transaction';

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { name, description, type } = req.body;
      
      if (!name || !type || !['income', 'expense'].includes(type)) {
        return res.status(400).json({ 
          message: 'Nombre y tipo son requeridos. El tipo debe ser "income" o "expense"' 
        });
      }
      
      // Verificar si ya existe una categoría con el mismo nombre y tipo
      const existingCategory = await CategoryModel.findByName(name, type as 'income' | 'expense');
      if (existingCategory) {
        return res.status(409).json({ message: 'Ya existe una categoría con ese nombre para este tipo' });
      }

      const categoryId = await CategoryModel.create({
        name,
        description,
        type,
        is_default: false
      });

      const category = await CategoryModel.findById(categoryId);
      
      return res.status(201).json({
        message: 'Categoría creada correctamente',
        category
      });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ya existe una categoría con ese nombre para este tipo' });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const type = req.query.type as 'income' | 'expense' | undefined;
      let page = Number(req.query.page);
      let limit = Number(req.query.limit);
      page = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
      limit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50;

      const result = await CategoryModel.findAll(type, page, limit);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Nombre es requerido' });
      }

      const category = await CategoryModel.findById(Number(id));
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      if (category.is_default) {
        return res.status(403).json({ message: 'No puedes modificar categorías predeterminadas' });
      }

      const updated = await CategoryModel.update(Number(id), { name, description });
      
      if (!updated) {
        return res.status(400).json({ message: 'Error al actualizar la categoría' });
      }

      const updatedCategory = await CategoryModel.findById(Number(id));
      return res.json({
        message: 'Categoría actualizada correctamente',
        category: updatedCategory
      });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ya existe una categoría con ese nombre para este tipo' });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const category = await CategoryModel.findById(Number(id));
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      if (category.is_default) {
        return res.status(403).json({ message: 'No puedes eliminar categorías predeterminadas' });
      }

      const deleted = await CategoryModel.delete(Number(id));
      
      if (!deleted) {
        return res.status(400).json({ message: 'Error al eliminar la categoría predeterminada' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const { id } = req.params;
      const category = await CategoryModel.findById(Number(id));
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      return res.json(category);
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getCategoryMonthlyConsolidated(req: Request, res: Response) {
    try {
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      const type = req.query.type as 'income' | 'expense' | undefined;
      const companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
      const data = await TransactionModel.getCategoryMonthlyConsolidated({ year, type, companyId });
      return res.json({ year, type, companyId, data });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
