// Simple persistent storage using file system for Vercel
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const INDEXED_FILE = path.join(DATA_DIR, 'indexed-content.json');
const UPLOADED_FILE = path.join(DATA_DIR, 'uploaded-content.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class PersistentStorage {
  private static ensureFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
    }
  }

  static loadIndexedContent(): any[] {
    try {
      this.ensureFile(INDEXED_FILE);
      const data = fs.readFileSync(INDEXED_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Error loading indexed content:', error);
      return [];
    }
  }

  static saveIndexedContent(content: any[]): void {
    try {
      this.ensureFile(INDEXED_FILE);
      fs.writeFileSync(INDEXED_FILE, JSON.stringify(content, null, 2), 'utf8');
      console.log('💾 Saved indexed content:', content.length, 'items');
    } catch (error) {
      console.error('Error saving indexed content:', error);
    }
  }

  static addIndexedContent(items: any[]): void {
    const existing = this.loadIndexedContent();
    const existingIds = new Set(existing.map(item => item.id));
    const newItems = items.filter(item => !existingIds.has(item.id));
    
    if (newItems.length > 0) {
      const updated = [...existing, ...newItems];
      this.saveIndexedContent(updated);
      console.log('📦 Added', newItems.length, 'new indexed items. Total:', updated.length);
    }
  }

  static loadUploadedContent(): any[] {
    try {
      this.ensureFile(UPLOADED_FILE);
      const data = fs.readFileSync(UPLOADED_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Error loading uploaded content:', error);
      return [];
    }
  }

  static addUploadedContent(item: any): void {
    try {
      const existing = this.loadUploadedContent();
      const updated = [item, ...existing]; // Add to beginning
      
      this.ensureFile(UPLOADED_FILE);
      fs.writeFileSync(UPLOADED_FILE, JSON.stringify(updated, null, 2), 'utf8');
      console.log('📤 Added uploaded item:', item.id, 'Total:', updated.length);
    } catch (error) {
      console.error('Error saving uploaded content:', error);
    }
  }
}