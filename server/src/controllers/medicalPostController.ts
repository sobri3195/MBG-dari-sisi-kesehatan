import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/schema';

export const createMedicalPost = (req: Request, res: Response) => {
  try {
    const { name, type, location, coordinates, staff_count, equipment_list } = req.body;

    if (!name || !type || !location) {
      return res.status(400).json({ error: 'Name, type, and location are required' });
    }

    const id = uuidv4();
    const created_at = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO medical_posts (
        id, name, type, location, coordinates, staff_count, equipment_list, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(id, name, type, location, coordinates, staff_count || 0, equipment_list, 'ACTIVE', created_at);

    const post = db.prepare('SELECT * FROM medical_posts WHERE id = ?').get(id);
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating medical post:', error);
    res.status(500).json({ error: 'Failed to create medical post' });
  }
};

export const getAllMedicalPosts = (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;

    let query = 'SELECT * FROM medical_posts WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const posts = db.prepare(query).all(...params);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching medical posts:', error);
    res.status(500).json({ error: 'Failed to fetch medical posts' });
  }
};

export const getMedicalPostById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = db.prepare('SELECT * FROM medical_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: 'Medical post not found' });
    }

    const inventory = db.prepare('SELECT * FROM medical_inventory WHERE post_id = ?').all(id);

    res.json({
      ...post,
      inventory
    });
  } catch (error) {
    console.error('Error fetching medical post:', error);
    res.status(500).json({ error: 'Failed to fetch medical post' });
  }
};

export const updateMedicalPost = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, location, coordinates, staff_count, equipment_list, status } = req.body;

    const post = db.prepare('SELECT * FROM medical_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: 'Medical post not found' });
    }

    const update = db.prepare(`
      UPDATE medical_posts
      SET name = ?, type = ?, location = ?, coordinates = ?, staff_count = ?, equipment_list = ?, status = ?
      WHERE id = ?
    `);

    update.run(name, type, location, coordinates, staff_count, equipment_list, status, id);

    const updated = db.prepare('SELECT * FROM medical_posts WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating medical post:', error);
    res.status(500).json({ error: 'Failed to update medical post' });
  }
};

export const addInventoryItem = (req: Request, res: Response) => {
  try {
    const { post_id, item_name, category, quantity, unit, minimum_stock } = req.body;

    if (!post_id || !item_name || !category || quantity === undefined || !unit) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const post = db.prepare('SELECT * FROM medical_posts WHERE id = ?').get(post_id);
    if (!post) {
      return res.status(404).json({ error: 'Medical post not found' });
    }

    const id = uuidv4();
    const last_updated = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO medical_inventory (
        id, post_id, item_name, category, quantity, unit, minimum_stock, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(id, post_id, item_name, category, quantity, unit, minimum_stock || 0, last_updated);

    const item = db.prepare('SELECT * FROM medical_inventory WHERE id = ?').get(id);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
};

export const updateInventoryItem = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, minimum_stock } = req.body;

    const item = db.prepare('SELECT * FROM medical_inventory WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const last_updated = new Date().toISOString();

    const update = db.prepare(`
      UPDATE medical_inventory
      SET quantity = ?, minimum_stock = ?, last_updated = ?
      WHERE id = ?
    `);

    update.run(quantity, minimum_stock, last_updated, id);

    const updated = db.prepare('SELECT * FROM medical_inventory WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

export const getInventoryByPost = (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const inventory = db.prepare(`
      SELECT * FROM medical_inventory 
      WHERE post_id = ?
      ORDER BY category, item_name
    `).all(postId);

    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const getLowStockItems = (req: Request, res: Response) => {
  try {
    const lowStock = db.prepare(`
      SELECT i.*, p.name as post_name, p.location
      FROM medical_inventory i
      JOIN medical_posts p ON i.post_id = p.id
      WHERE i.quantity <= i.minimum_stock
      ORDER BY i.quantity ASC
    `).all();

    res.json(lowStock);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
};
