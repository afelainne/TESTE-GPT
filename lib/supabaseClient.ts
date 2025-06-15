// Client-side Supabase configuration for storage operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjidivtwncamikujcpvx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaWRpdnR3bmNhbWlrdWpjcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NzY1MzcsImV4cCI6MjA2NTA1MjUzN30.RttDikGNfeO5HYQ75VVwpvbImhvlnalUZbcJCQIyNLI';

// Check if we have real credentials  
const hasRealCredentials = supabaseUrl.includes('tjidivtwncamikujcpvx') && 
  supabaseAnonKey.length > 50;

console.log('🔧 Client Supabase Configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  hasRealCredentials,
  url: hasRealCredentials ? 'Real' : 'Demo'
});

// Create client (even with demo credentials for fallback)
export const supabaseClient = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key'
);

// Storage operations with fallback
export const supabaseStorage = {
  // Upload file to Supabase Storage
  async uploadFile(bucket: string, fileName: string, file: File): Promise<string | null> {
    if (!hasRealCredentials) {
      console.warn('⚠️ Demo mode - Supabase Storage not available');
      return null;
    }

    try {
      console.log('📤 Uploading to Supabase Storage:', { bucket, fileName });

      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Supabase Storage upload error:', error);
        return null;
      }

      // Get public URL
      const { data: publicData } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('✅ File uploaded to Supabase Storage:', publicData.publicUrl);
      return publicData.publicUrl;

    } catch (error) {
      console.error('❌ Supabase Storage upload failed:', error);
      return null;
    }
  },

  // List ALL files in bucket without pagination
  async listAllFiles(bucket: string, folder = ''): Promise<any[]> {
    if (!hasRealCredentials) {
      console.warn('⚠️ Demo mode - returning empty file list');
      return [];
    }

    try {
      console.log('📂 Listing ALL Supabase Storage files:', { bucket, folder });

      let allFiles: any[] = [];
      let offset = 0;
      const batchSize = 1000; // Maximum allowed by Supabase
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabaseClient.storage
          .from(bucket)
          .list(folder, {
            limit: batchSize,
            offset: offset,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.error('❌ Supabase Storage list error:', error);
          break;
        }

        if (data && data.length > 0) {
          allFiles = [...allFiles, ...data];
          offset += batchSize;
          hasMore = data.length === batchSize; // Continue if we got a full batch
        } else {
          hasMore = false;
        }
      }

      console.log(`📂 Found ${allFiles.length} total files in Supabase Storage`);
      return allFiles;

    } catch (error) {
      console.error('❌ Supabase Storage list failed:', error);
      return [];
    }
  },

  // Get public URL for a file
  getPublicUrl(bucket: string, fileName: string): string | null {
    if (!hasRealCredentials) {
      return null;
    }

    try {
      const { data } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('❌ Failed to get public URL:', error);
      return null;
    }
  },

  // Delete file
  async deleteFile(bucket: string, fileName: string): Promise<boolean> {
    if (!hasRealCredentials) {
      console.warn('⚠️ Demo mode - delete operation skipped');
      return false;
    }

    try {
      const { error } = await supabaseClient.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('❌ Supabase Storage delete error:', error);
        return false;
      }

      console.log('✅ File deleted from Supabase Storage:', fileName);
      return true;

    } catch (error) {
      console.error('❌ Supabase Storage delete failed:', error);
      return false;
    }
  }
};

export default supabaseClient;