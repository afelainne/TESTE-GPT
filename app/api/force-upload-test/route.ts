import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { count = 10 } = await request.json();
    
    console.log(`🧪 Force uploading ${count} test images to verify insert capability...`);
    
    const testImages = [];
    const results: Array<{ index: number; success: boolean; error?: string; id?: string }> = [];
    
    for (let i = 200; i < 200 + count; i++) {
      const testImage = {
        image_url: `https://picsum.photos/400/600?random=${i}`,
        title: `Test Image ${i}`,
        author_name: 'Test Author',
        source_url: `https://test.com/image/${i}`,
        metadata: {
          test: true,
          batch: 'force_upload_test',
          timestamp: new Date().toISOString(),
          index: i
        }
      };
      
      try {
        console.log(`📤 Inserting test image ${i}...`);
        
        const { data, error } = await supabaseAdmin
          .from('clip_vectors')
          .insert([testImage])
          .select()
          .single();
        
        if (error) {
          console.error(`❌ Insert failed for image ${i}:`, error);
          results.push({ 
            index: i, 
            success: false, 
            error: error.message 
          });
        } else {
          console.log(`✅ Successfully inserted image ${i} with ID:`, data.id);
          results.push({ 
            index: i, 
            success: true, 
            id: data.id 
          });
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (insertError) {
        console.error(`❌ Exception inserting image ${i}:`, insertError);
        results.push({ 
          index: i, 
          success: false, 
          error: insertError instanceof Error ? insertError.message : 'Unknown error' 
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    console.log(`🧪 Force upload test completed: ${successCount} success, ${errorCount} errors`);
    
    // Get final count
    const { data: finalCount, error: countError } = await supabaseAdmin
      .from('clip_vectors')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      test_completed: true,
      attempted: count,
      results: {
        successful_inserts: successCount,
        failed_inserts: errorCount,
        details: results
      },
      final_database_count: countError ? 'unknown' : finalCount,
      message: `Force uploaded ${successCount}/${count} test images`
    });
    
  } catch (error) {
    console.error('❌ Force upload test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Force upload test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}