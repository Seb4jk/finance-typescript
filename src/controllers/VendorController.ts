import { Request, Response } from 'express';
import { VendorModel } from '../models/Vendor';
import { TokenPayload } from '../types/auth';
import { validateAndFormatRut } from '../utils/rutValidator';

export class VendorController {
  async createVendor(req: Request, res: Response) {
    try {
      // Obtener user_id del token, no del body
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { name, tax_id, business_activity, email, phone, address, region_id, commune_id, notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre del proveedor es requerido' });
      }
      if (!region_id || !commune_id) {
        return res.status(400).json({ message: 'Región y comuna son obligatorias' });
      }

      if (!tax_id) {
        return res.status(400).json({ message: 'El RUT del proveedor es obligatorio' });
      }
      const formattedTaxId = validateAndFormatRut(tax_id);
      if (!formattedTaxId) {
        return res.status(400).json({ message: 'El RUT proporcionado no es válido' });
      }
      const existingVendor = await VendorModel.findByTaxId(formattedTaxId);
      if (existingVendor) {
        return res.status(409).json({ 
          message: 'Ya existe un proveedor con este RUT', 
          data: existingVendor 
        });
      }
      const vendorId = await VendorModel.create({
        name,
        tax_id: formattedTaxId,
        business_activity,
        email,
        phone,
        address,
        region_id,
        commune_id,
        notes,
        user_id: userId
      });
      const vendor = await VendorModel.findById(vendorId);
      return res.status(201).json({
        success: true,
        message: 'Proveedor creado exitosamente',
        data: vendor
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getVendors(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { name, region_id, commune_id, tax_id } = req.query;
      
      const vendors = await VendorModel.findAll(userId, {
        name: name as string,
        region_id: region_id ? Number(region_id) : undefined,
        commune_id: commune_id ? Number(commune_id) : undefined,
        tax_id: tax_id as string
      });
      
      return res.json({
        success: true,
        message: 'Proveedores obtenidos exitosamente',
        data: vendors
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getVendorById(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const vendor = await VendorModel.findById(Number(id));
      
      if (!vendor) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }
      
      if (vendor.user_id !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para ver este proveedor' });
      }
      
      return res.json({
        success: true,
        message: 'Proveedor obtenido exitosamente',
        data: vendor
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async updateVendor(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      const { name, tax_id, business_activity, email, phone, address, region_id, commune_id, notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre del proveedor es requerido' });
      }

      // Validar y formatear el RUT si se proporciona
      let formattedTaxId = null;
      if (tax_id) {
        formattedTaxId = validateAndFormatRut(tax_id);
        if (!formattedTaxId) {
          return res.status(400).json({ message: 'El RUT proporcionado no es válido' });
        }
      }
      
      const vendor = await VendorModel.findById(Number(id));
      
      if (!vendor) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }
      
      if (vendor.user_id !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para editar este proveedor' });
      }

      const updated = await VendorModel.update(Number(id), userId, {
        name,
        tax_id: formattedTaxId,
        business_activity,
        email,
        phone,
        address,
        region_id,
        commune_id,
        notes
      });
      
      if (!updated) {
        return res.status(400).json({ message: 'Error al actualizar el proveedor' });
      }

      const updatedVendor = await VendorModel.findById(Number(id));
      return res.json({
        success: true,
        message: 'Proveedor actualizado exitosamente',
        data: updatedVendor
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteVendor(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const vendor = await VendorModel.findById(Number(id));
      
      if (!vendor) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }
      
      if (vendor.user_id !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este proveedor' });
      }

      const deleted = await VendorModel.delete(Number(id), userId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Error al eliminar el proveedor' });
      }

      return res.status(204).json({
        success: true,
        message: 'Proveedor eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
