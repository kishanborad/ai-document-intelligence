import { useState, useCallback, useMemo } from 'react';
import StepHeader from '../shell/StepHeader';
import EntityTypeToggles from '../ner/EntityTypeToggles';
import CustomPatternEditor, { loadSavedPatterns } from '../ner/CustomPatternEditor';
import AnnotatedText from '../ner/AnnotatedText';
import EntityTable from '../ner/EntityTable';
import { useDocStore, useDocDispatch } from '../../store/DocStoreContext';
import { useWorker } from '../../hooks/useWorker';
import { extractRegexEntities } from '../../services/regexEntities';
import { mergeEntities } from '../../services/mergeEntities';
import { chunkText } from '../../services/chunkText';
import type { Entity, CustomPattern } from '../../store/types';

const ALL_TYPES = new Set([
  'Person', 'Organization', 'Location', 'Date',
  'Email', 'Phone', 'Money', 'URL', 'Invoice#',
]);

type NerStatus = 'idle' | 'processing' | 'done' | 'error';

interface NerStepProps {
  extractedText: string;
}

export default function NerStep({ extractedText }: NerStepProps) {
  const store = useDocStore();
  const dispatch = useDocDispatch();

  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(ALL_TYPES);
  const [customPatterns, setCustomPatterns] = useState<CustomPattern[]>(
    store.ner?.customPatterns ?? loadSavedPatterns(),
  );
  const [status, setStatus] = useState<NerStatus>(store.ner ? 'done' : 'idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bertEntities, setBertEntities] = useState<Entity[]>([]);
  const [useBert, setUseBert] = useState(true);

  // Regex entities recompute instantly
  const regexEntities = useMemo(
    () => extractRegexEntities(extractedText, enabledTypes, customPatterns),
    [extractedText, enabledTypes, customPatterns],
  );

  // Merged entities (regex + BERT)
  const allEntities = useMemo(
    () => mergeEntities(regexEntities, bertEntities.filter((e) => enabledTypes.has(e.type))),
    [regexEntities, bertEntities, enabledTypes],
  );

  const createWorkerFn = useCallback(
    () => new Worker(new URL('../../workers/ner.worker.ts', import.meta.url), { type: 'module' }),
    [],
  );

  const { postMessage, terminate } = useWorker(createWorkerFn, {
    onProgress: (percent, stageMsg) => {
      setProgress(percent);
      setStage(stageMsg);
    },
    onResult: (data) => {
      const entities = (data as Array<Omit<Entity, 'source'>>).map((e) => ({
        ...e,
        source: 'bert' as const,
      }));
      setBertEntities(entities);
      setStatus('done');

      const merged = mergeEntities(regexEntities, entities.filter((e) => enabledTypes.has(e.type)));
      dispatch({
        type: 'SET_NER',
        payload: { entities: merged, customPatterns },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 3 });
    },
    onError: (message) => {
      setError(message);
      setStatus('error');
      // Regex entities still work — mark step complete with regex only
      dispatch({
        type: 'SET_NER',
        payload: { entities: regexEntities, customPatterns },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 3 });
    },
  });

  const handleRun = useCallback(() => {
    if (!extractedText) return;

    // Always save regex entities immediately
    dispatch({
      type: 'SET_NER',
      payload: { entities: regexEntities, customPatterns },
    });
    dispatch({ type: 'COMPLETE_STEP', payload: 3 });

    if (!useBert) {
      setStatus('done');
      return;
    }

    setStatus('processing');
    setProgress(0);
    setStage('Starting NER...');
    setError(null);

    const chunks = chunkText(extractedText);
    postMessage({ type: 'PROCESS', payload: { chunks } });
  }, [extractedText, useBert, regexEntities, customPatterns, postMessage, dispatch]);

  const handleRetry = useCallback(() => {
    terminate();
    handleRun();
  }, [terminate, handleRun]);

  const isProcessing = status === 'processing';

  return (
    <div>
      <StepHeader
        title="Named Entity Recognition"
        description="Identify people, organizations, dates, and more in your document."
      />

      <div className="space-y-4">
        {/* Entity type toggles */}
        <div>
          <p className="text-[11px] text-dimmed mb-2 font-medium">Entity Types</p>
          <EntityTypeToggles enabled={enabledTypes} onChange={setEnabledTypes} disabled={isProcessing} />
        </div>

        {/* BERT toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useBert}
              onChange={(e) => setUseBert(e.target.checked)}
              disabled={isProcessing}
              className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
            />
            <span className="text-xs text-surface">Use BERT NER model (~50MB)</span>
          </label>
          <span className="text-[10px] text-dimmed">
            {useBert ? 'Regex + AI' : 'Regex only (instant)'}
          </span>
        </div>

        {/* Custom patterns */}
        <CustomPatternEditor
          patterns={customPatterns}
          onChange={setCustomPatterns}
          disabled={isProcessing}
        />

        {/* Run button */}
        {status === 'idle' && (
          <button
            onClick={handleRun}
            className="w-full py-3 rounded-xl text-sm font-semibold gradient-accent text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all duration-200 cursor-pointer"
          >
            {useBert ? 'Run NER (Regex + BERT)' : 'Run NER (Regex Only)'}
          </button>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="glass-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-surface">Processing</span>
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

        {/* Error (degraded — regex still works) */}
        {status === 'error' && error && (
          <div className="px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-warning text-[11px] flex items-center justify-between">
            <span>BERT model failed: {error}. Showing regex results only.</span>
            <button
              onClick={handleRetry}
              className="ml-3 px-2 py-0.5 rounded text-[10px] font-medium border border-warning/30 hover:bg-warning/10 cursor-pointer"
            >
              Retry BERT
            </button>
          </div>
        )}

        {/* Results */}
        {(status === 'done' || status === 'error') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-dimmed mb-2 font-medium">
                Annotated Text
                <span className="ml-2 text-dimmed/60">
                  Solid = regex, dashed = BERT. Hover for details.
                </span>
              </p>
              <AnnotatedText text={extractedText} entities={allEntities} />
            </div>
            <div>
              <p className="text-[11px] text-dimmed mb-2 font-medium">
                Entities ({allEntities.length})
              </p>
              <EntityTable entities={allEntities} />
            </div>
          </div>
        )}

        {/* Re-run */}
        {status === 'done' && (
          <button
            onClick={() => { setStatus('idle'); setBertEntities([]); }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-dimmed border border-panel-border hover:text-surface hover:border-white/15 transition-all duration-200 cursor-pointer"
          >
            Re-run NER
          </button>
        )}
      </div>
    </div>
  );
}
