import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PUT /api/clip-vectors/[id] - Update a clip vector entry
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    console.log('📝 Updating clip vector:', id, updateData);
    
    const { data, error } = await supabaseAdmin
      .from('clip_vectors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update item',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Updated successfully:', data.id);
    
    return NextResponse.json({
      success: true,
      item: data,
      message: 'Item updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process update request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/clip-vectors/[id] - Delete a clip vector entry
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    console.log('🗑️ Deleting clip vector:', id);
    
    const { error } = await supabaseAdmin
      .from('clip_vectors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Delete error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete item',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('✅ Deleted successfully:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process delete request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}