import { Request, Response } from 'express';
import { VendorModel } from '../models/Vendor';
import { TokenPayload } from '../types/auth';
import { validateAndFormatRut } from '../utils/rutValidator';

export class VendorController {
  async createVendor(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { name, tax_id, contact_name, email, phone, address, city, country, industry, notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre del proveedor es requerido' });
      }

      // Validar RUT chileno (obligatorio)
      if (!tax_id) {
        return res.status(400).json({ message: 'El RUT del proveedor es obligatorio' });
      }
      
      // Validar y formatear el RUT
      const formattedTaxId = validateAndFormatRut(tax_id);
      
      if (!formattedTaxId) {
        return res.status(400).json({ message: 'El RUT proporcionado no es válido' });
      }
      
      // Verificar si ya existe un proveedor con este RUT
      const existingVendor = await VendorModel.findByTaxId(formattedTaxId);
      if (existingVendor) {
        return res.status(409).json({ 
          message: 'Ya existe un proveedor con este RUT', 
          existingVendor 
        });
      }

      const vendorId = await VendorModel.create({
        name,
        tax_id: formattedTaxId,
        contact_name,
        email,
        phone,
        address,
        city,
        country,
        industry,
        notes,
        user_id: userId
      });

      const vendor = await VendorModel.findById(vendorId);
      
      return res.status(201).json(vendor);
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ya existe un proveedor con este RUT' });
      }
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

      const { name, industry, country, tax_id } = req.query;
      
      const vendors = await VendorModel.findAll(userId, {
        name: name as string,
        industry: industry as string,
        country: country as string,
        tax_id: tax_id as string
      });
      
      return res.json(vendors);
    } catch (error) {
      console.error('Error getting vendors:', error);
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
      
      return res.json(vendor);
    } catch (error) {
      console.error('Error getting vendor:', error);
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
      const { name, tax_id, contact_name, email, phone, address, city, country, industry, notes } = req.body;
      
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
        contact_name,
        email,
        phone,
        address,
        city,
        country,
        industry,
        notes
      });
      
      if (!updated) {
        return res.status(400).json({ message: 'Error al actualizar el proveedor' });
      }

      const updatedVendor = await VendorModel.findById(Number(id));
      return res.json(updatedVendor);
    } catch (error) {
      console.error('Error updating vendor:', error);
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

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
