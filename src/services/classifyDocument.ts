import { cosineSimilarity } from './cosineSimilarity';
import type { Classification, CustomCategory } from '../store/types';

const FIXED_CATEGORIES = [
  {
    category: 'Invoice',
    keywords: 'invoice bill payment amount due total tax subtotal purchase order PO number billing',
  },
  {
    category: 'Receipt',
    keywords: 'receipt transaction paid total items purchased store merchant change cash credit card',
  },
  {
    category: 'Resume',
    keywords: 'resume curriculum vitae experience education skills employment work history qualifications professional',
  },
  {
    category: 'Letter',
    keywords: 'dear sincerely regards letter correspondence to whom it may concern subject address',
  },
  {
    category: 'ID Card',
    keywords: 'identification card passport driver license date of birth expiry nationality photo ID number',
  },
  {
    category: 'Contract',
    keywords: 'agreement contract terms conditions party parties clause obligations hereby signed witness effective date',
  },
  {
    category: 'Report',
    keywords: 'report analysis findings summary results data conclusion recommendation metrics performance overview',
  },
];

/**
 * Classify document text against fixed and custom categories using embedding similarity.
 * @param textEmbedding - Embedding vector for the document text
 * @param categoryEmbeddings - Map of category label to embedding vector
 * @param customCategories - User-defined categories with example embeddings
 * @param customEmbeddings - Map of custom category ID to averaged example embedding
 */
export function classifyDocument(
  textEmbedding: number[],
  categoryEmbeddings: Map<string, number[]>,
  customCategories: CustomCategory[],
  customEmbeddings: Map<string, number[]>,
): Classification[] {
  const results: Classification[] = [];

  // Fixed categories
  for (const cat of FIXED_CATEGORIES) {
    const catEmb = categoryEmbeddings.get(cat.category);
    if (!catEmb) continue;

    const score = cosineSimilarity(textEmbedding, catEmb);
    results.push({
      category: cat.category,
      score: Math.max(0, score),
      isCustom: false,
    });
  }

  // Custom categories
  for (const custom of customCategories) {
    const emb = customEmbeddings.get(custom.id);
    if (!emb) continue;

    const score = cosineSimilarity(textEmbedding, emb);
    results.push({
      category: custom.label,
      score: Math.max(0, score),
      isCustom: true,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

export { FIXED_CATEGORIES };
