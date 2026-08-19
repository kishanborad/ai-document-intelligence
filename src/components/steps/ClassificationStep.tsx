import { useState, useCallback, useMemo } from 'react';
import StepHeader from '../shell/StepHeader';
import FixedCategories from '../classification/FixedCategories';
import CustomCategoryTrainer, { loadSavedCategories } from '../classification/CustomCategoryTrainer';
import ClassificationResult from '../classification/ClassificationResult';
import { useDocStore, useDocDispatch } from '../../store/DocStoreContext';
import { useWorker } from '../../hooks/useWorker';
import { classifyDocument, FIXED_CATEGORIES } from '../../services/classifyDocument';
import type { Classification, CustomCategory } from '../../store/types';

type ClassifyStatus = 'idle' | 'loading' | 'done' | 'error';

interface ClassificationStepProps {
  extractedText: string;
}

export default function ClassificationStep({ extractedText }: ClassificationStepProps) {
  const store = useDocStore();
  const dispatch = useDocDispatch();

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    store.classification?.customCategories ?? loadSavedCategories(),
  );
  const [status, setStatus] = useState<ClassifyStatus>(store.classification ? 'done' : 'idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Classification[]>(store.classification?.results ?? []);

  const createWorkerFn = useCallback(
    () => new Worker(new URL('../../workers/embedding.worker.ts', import.meta.url), { type: 'module' }),
    [],
  );

  const { postMessage, terminate } = useWorker(createWorkerFn, {
    onProgress: (percent, stageMsg) => {
      setProgress(percent);
      setStage(stageMsg);
    },
    onResult: (data) => {
      const embeddings = data as Record<string, number[]>;

      // Extract text embedding
      const textEmb = embeddings['__document__'];
      if (!textEmb) {
        setError('Failed to embed document text');
        setStatus('error');
        return;
      }

      // Build category embedding map
      const categoryEmbeddings = new Map<string, number[]>();
      for (const cat of FIXED_CATEGORIES) {
        const emb = embeddings[cat.category];
        if (emb) categoryEmbeddings.set(cat.category, emb);
      }

      // Build custom embedding map
      const customEmbeddings = new Map<string, number[]>();
      for (const cat of customCategories) {
        const exampleEmbKeys = cat.examples.map((_, i) => `custom:${cat.id}:${i}`);
        const exampleVectors = exampleEmbKeys
          .map((k) => embeddings[k])
          .filter(Boolean);

        if (exampleVectors.length > 0) {
          // Average example embeddings
          const dim = exampleVectors[0].length;
          const avg = new Array(dim).fill(0);
          for (const vec of exampleVectors) {
            for (let j = 0; j < dim; j++) avg[j] += vec[j];
          }
          for (let j = 0; j < dim; j++) avg[j] /= exampleVectors.length;
          customEmbeddings.set(cat.id, avg);
        }
      }

      const classified = classifyDocument(
        textEmb,
        categoryEmbeddings,
        customCategories,
        customEmbeddings,
      );

      setResults(classified);
      setStatus('done');

      dispatch({
        type: 'SET_CLASSIFICATION',
        payload: { results: classified, customCategories },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 4 });
    },
    onError: (message) => {
      setError(message);
      setStatus('error');
    },
  });

  // Gather all texts to embed in one batch
  const textsAndLabels = useMemo(() => {
    const texts: string[] = [];
    const labels: string[] = [];

    // Document text (truncate for embedding model)
    const docSnippet = extractedText.slice(0, 2000);
    texts.push(docSnippet);
    labels.push('__document__');

    // Fixed category keywords
    for (const cat of FIXED_CATEGORIES) {
      texts.push(cat.keywords);
      labels.push(cat.category);
    }

    // Custom category examples
    for (const cat of customCategories) {
      for (let i = 0; i < cat.examples.length; i++) {
        texts.push(cat.examples[i]);
        labels.push(`custom:${cat.id}:${i}`);
      }
    }

    return { texts, labels };
  }, [extractedText, customCategories]);

  const handleRun = useCallback(() => {
    if (!extractedText) return;

    setStatus('loading');
    setProgress(0);
    setStage('Initializing...');
    setError(null);

    postMessage({
      type: 'EMBED',
      payload: textsAndLabels,
    });
  }, [extractedText, textsAndLabels, postMessage]);

  const handleRetry = useCallback(() => {
    terminate();
    handleRun();
  }, [terminate, handleRun]);

  const isLoading = status === 'loading';

  return (
    <div>
      <StepHeader
        title="Document Classification"
        description="Classify your document into categories using AI embeddings."
      />

      <div className="space-y-4">
        {/* Custom category trainer */}
        <CustomCategoryTrainer
          categories={customCategories}
          onChange={setCustomCategories}
          disabled={isLoading}
        />

        {/* Run button */}
        {status === 'idle' && (
          <button
            onClick={handleRun}
            disabled={!extractedText}
            className="w-full py-3 rounded-xl text-sm font-semibold gradient-accent text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            Classify Document (~23MB model)
          </button>
        )}

        {/* Progress */}
        {isLoading && (
          <div className="glass-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-surface">Classifying</span>
              <span className="text-[11px] text-accent font-semibold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full gradient-accent transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-dimmed mt-2">{stage}</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && error && (
          <div className="px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-[11px] flex items-center justify-between">
            <span>Classification failed: {error}</span>
            <button
              onClick={handleRetry}
              className="ml-3 px-2 py-0.5 rounded text-[10px] font-medium border border-error/30 hover:bg-error/10 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results */}
        {status === 'done' && results.length > 0 && (
          <div className="space-y-4">
            <FixedCategories results={results} />
            <ClassificationResult results={results} />
          </div>
        )}

        {/* Re-run */}
        {status === 'done' && (
          <button
            onClick={() => { setStatus('idle'); setResults([]); }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-dimmed border border-panel-border hover:text-surface hover:border-white/15 transition-all duration-200 cursor-pointer"
          >
            Re-classify
          </button>
        )}
      </div>
    </div>
  );
}
