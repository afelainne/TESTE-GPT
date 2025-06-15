'use client';

import { InspirationItem } from '@/types/inspiration';
import { externalPlatforms } from '@/lib/externalPlatforms';

// Cache global para evitar recarregamentos
const globalCache = new Map<string, {
  data: InspirationItem[];
  timestamp: number;
  accessCount: number;
}>();

// Pool de conteúdo externo pré-carregado
let externalContentPool: InspirationItem[] = [];
let poolLastUpdate = 0;

// Função otimizada para busca rápida de similares
export async function findSimilarItemsFast(
  targetItem: InspirationItem,
  similarityType: 'visual' | 'color' | 'semantic' | 'style' | 'thematic' | 'mixed' = 'visual',
  limit: number = 30
): Promise<InspirationItem[]> {
  console.log('⚡ Fast similarity search for:', targetItem.id);
  
  const startTime = Date.now();
  
  try {
    // Use pool de conteúdo se disponível e recente (5 min)
    const poolAge = Date.now() - poolLastUpdate;
    if (externalContentPool.length > 500 && poolAge < 5 * 60 * 1000) {
      console.log('🚀 Using pre-loaded content pool:', externalContentPool.length, 'items');
      return findSimilarFromPool(targetItem, similarityType, limit);
    }

    // Busca com cache inteligente
    const cacheKey = `${targetItem.category}_${similarityType}`;
    const cached = globalCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 3 * 60 * 1000) { // 3 min cache
      console.log('📦 Using cached external content');
      cached.accessCount++;
      return findSimilarFromList(targetItem, cached.data, similarityType, limit);
    }

    // Carregamento rápido e paralelo
    console.log('🔄 Loading fresh external content...');
    const freshContent = await loadExternalContentFast(targetItem, similarityType);
    
    // Cache o resultado
    globalCache.set(cacheKey, {
      data: freshContent,
      timestamp: Date.now(),
      accessCount: 1
    });

    // Atualiza pool se necessário
    if (freshContent.length > 0) {
      updateContentPool(freshContent);
    }

    const result = findSimilarFromList(targetItem, freshContent, similarityType, limit);
    console.log(`⚡ Fast search completed in ${Date.now() - startTime}ms`);
    
    return result;

  } catch (error) {
    console.error('❌ Fast similarity failed:', error);
    return generateFallbackSimilar(targetItem, limit);
  }
}

// Carregamento otimizado de conteúdo externo
async function loadExternalContentFast(
  targetItem: InspirationItem,
  similarityType: string
): Promise<InspirationItem[]> {
  
  const queries = generateSmartQueries(targetItem, similarityType);
  const allContent: any[] = [];
  
  // Busca paralela com menos páginas para velocidade
  const promises = queries.slice(0, 2).map(async (query) => {
    try {
      return await externalPlatforms.fetchAllPlatforms(query);
    } catch (error) {
      console.error(`Failed query: ${query}`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(promises);
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allContent.push(...result.value);
    }
  });

  // Remove duplicatas e converte
  const uniqueImages = removeDuplicates(allContent);
  return externalPlatforms.convertToInspirationItems(uniqueImages);
}

// Gera queries inteligentes baseadas no item
function generateSmartQueries(
  targetItem: InspirationItem,
  similarityType: string
): string[] {
  const baseQueries: Record<string, string[]> = {
    visual: [
      `${targetItem.visualStyle.composition} ${targetItem.visualStyle.shapes}`,
      `${targetItem.category} ${targetItem.visualStyle.mood}`,
      'visual design inspiration'
    ],
    color: [
      `${targetItem.visualStyle.colorTone} palette`,
      `${targetItem.category} color`,
      'color design inspiration'
    ],
    semantic: [
      targetItem.tags.slice(0, 2).join(' '),
      `${targetItem.category} design`,
      'semantic design'
    ],
    style: [
      `${targetItem.category} ${targetItem.visualStyle.mood}`,
      targetItem.visualStyle.composition,
      'style design'
    ],
    thematic: [
      `${targetItem.category} inspiration`,
      targetItem.tags[0] || 'design',
      'thematic design'
    ],
    mixed: [
      `${targetItem.category} design`,
      'creative inspiration',
      'mixed design'
    ]
  };

  return baseQueries[similarityType] || baseQueries.mixed;
}

// Busca rápida de similares usando algoritmo simplificado
function findSimilarFromList(
  targetItem: InspirationItem,
  items: InspirationItem[],
  similarityType: string,
  limit: number
): InspirationItem[] {
  
  if (items.length === 0) return [];

  const scored = items
    .filter(item => item.id !== targetItem.id)
    .map(item => ({
      item,
      score: calculateQuickSimilarity(targetItem, item, similarityType)
    }))
    .filter(({ score }) => score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit * 2); // Get more for diversity

  // Diversifica resultados
  return diversifyResults(scored.map(s => s.item), limit);
}

// Busca no pool pré-carregado
function findSimilarFromPool(
  targetItem: InspirationItem,
  similarityType: string,
  limit: number
): InspirationItem[] {
  
  // Filtra pool por categoria primeiro
  const categoryFiltered = externalContentPool.filter(item => 
    item.category === targetItem.category || 
    item.tags.some(tag => targetItem.tags.includes(tag))
  );

  const candidates = categoryFiltered.length > 50 ? categoryFiltered : externalContentPool;
  return findSimilarFromList(targetItem, candidates, similarityType, limit);
}

// Similaridade rápida (simplificada para performance)
function calculateQuickSimilarity(
  target: InspirationItem,
  candidate: InspirationItem,
  similarityType: string
): number {
  
  let score = 0;

  // Categoria (peso 20%)
  if (target.category === candidate.category) score += 0.2;

  // Tags (peso 30%)
  const commonTags = target.tags.filter(tag => candidate.tags.includes(tag));
  score += (commonTags.length / Math.max(target.tags.length, 1)) * 0.3;

  // Visual style (peso 50%)
  const visualMatch = calculateVisualMatch(target.visualStyle, candidate.visualStyle);
  score += visualMatch * 0.5;

  // Boost por tipo de similaridade
  const typeBoost = getTypeBoost(target, candidate, similarityType);
  score = Math.min(1, score + typeBoost);

  return score;
}

function calculateVisualMatch(target: any, candidate: any): number {
  let match = 0;
  if (target.composition === candidate.composition) match += 0.25;
  if (target.colorTone === candidate.colorTone) match += 0.25;
  if (target.shapes === candidate.shapes) match += 0.25;
  if (target.mood === candidate.mood) match += 0.25;
  return match;
}

function getTypeBoost(target: InspirationItem, candidate: InspirationItem, type: string): number {
  switch (type) {
    case 'color':
      return target.visualStyle.colorTone === candidate.visualStyle.colorTone ? 0.2 : 0;
    case 'style':
      return target.visualStyle.mood === candidate.visualStyle.mood ? 0.2 : 0;
    case 'visual':
      return target.visualStyle.composition === candidate.visualStyle.composition ? 0.2 : 0;
    default:
      return 0;
  }
}

// Diversifica resultados para evitar repetições
function diversifyResults(items: InspirationItem[], limit: number): InspirationItem[] {
  const diverse: InspirationItem[] = [];
  const usedMoods = new Set<string>();
  const usedCompositions = new Set<string>();
  
  // Primeira passada: pega items com características diferentes
  for (const item of items) {
    if (diverse.length >= limit) break;
    
    const mood = item.visualStyle.mood;
    const composition = item.visualStyle.composition;
    
    if (!usedMoods.has(mood) || !usedCompositions.has(composition)) {
      diverse.push(item);
      usedMoods.add(mood);
      usedCompositions.add(composition);
    }
  }
  
  // Segunda passada: completa com os melhores restantes
  for (const item of items) {
    if (diverse.length >= limit) break;
    if (!diverse.some(d => d.id === item.id)) {
      diverse.push(item);
    }
  }
  
  return diverse.slice(0, limit);
}

// Remove duplicatas
function removeDuplicates(items: any[]): any[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.imageUrl || item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Atualiza pool de conteúdo
function updateContentPool(newItems: InspirationItem[]) {
  // Adiciona novos items ao pool
  externalContentPool.push(...newItems);
  
  // Remove duplicatas
  const uniquePool = removeDuplicatesFromPool(externalContentPool);
  
  // Mantém apenas os 1000 mais recentes
  externalContentPool = uniquePool.slice(-1000);
  poolLastUpdate = Date.now();
  
  console.log('🔄 Content pool updated:', externalContentPool.length, 'items');
}

function removeDuplicatesFromPool(items: InspirationItem[]): InspirationItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// Fallback rápido se tudo falhar
function generateFallbackSimilar(targetItem: InspirationItem, limit: number): InspirationItem[] {
  console.log('🔄 Generating fallback similar items');
  
  // Retorna um array vazio para evitar items fictícios
  return [];
}

// Função para pré-carregar conteúdo em background
export async function preloadExternalContent() {
  if (externalContentPool.length > 500) return;
  
  console.log('🚀 Pre-loading external content in background...');
  
  const queries = [
    'graphic design',
    'ui design',
    'typography',
    'branding',
    'illustration',
    'creative inspiration'
  ];
  
  try {
    const promises = queries.map(query => externalPlatforms.fetchAllPlatforms(query));
    const results = await Promise.allSettled(promises);
    
    const allContent: any[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allContent.push(...result.value);
      }
    });
    
    const converted = externalPlatforms.convertToInspirationItems(allContent);
    updateContentPool(converted);
    
  } catch (error) {
    console.error('Failed to preload content:', error);
  }
}