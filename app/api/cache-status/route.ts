import { NextResponse } from 'next/server';
import { localVectorCache } from '@/lib/localCache';

export async function GET() {
  try {
    const cacheStatus = localVectorCache.count();
    const allVectors = localVectorCache.getAll();
    
    console.log('📊 Cache status requested:', cacheStatus);
    
    return NextResponse.json({
      status: 'success',
      cache: cacheStatus,
      vectors: allVectors.map(v => ({
        id: v.id,
        title: v.title,
        created_at: v.created_at,
        has_embedding: !!v.embedding,
        metadata: v.metadata
      })),
      message: `Local cache contains ${cacheStatus.total} vectors`
    });
    
  } catch (error) {
    console.error('❌ Error checking cache status:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check cache status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}