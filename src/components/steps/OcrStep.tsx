import { useState, useCallback, useRef } from 'react';
import StepHeader from '../shell/StepHeader';
import EngineSelector from '../ocr/EngineSelector';
import LanguageSelector from '../ocr/LanguageSelector';
import OcrProgress from '../ocr/OcrProgress';
import OcrResult from '../ocr/OcrResult';
import { useDocStore, useDocDispatch } from '../../store/DocStoreContext';
import { useWorker } from '../../hooks/useWorker';
import type { WordBox } from '../../store/types';

type OcrEngine = 'tesseract' | 'paddle';
type OcrStatus = 'idle' | 'processing' | 'done' | 'error';

interface OcrData {
  text: string;
  confidence: number;
  wordBoxes: WordBox[];
}

export default function OcrStep() {
  const store = useDocStore();
  const dispatch = useDocDispatch();

  const [engine, setEngine] = useState<OcrEngine>('tesseract');
  const [language, setLanguage] = useState('eng');
  const [status, setStatus] = useState<OcrStatus>(store.ocr ? 'done' : 'idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editedText, setEditedText] = useState(store.ocr?.text ?? '');
  const [confidence, setConfidence] = useState(store.ocr?.confidence ?? 0);
  const wordBoxesRef = useRef<WordBox[]>(store.ocr?.wordBoxes ?? []);

  const createWorkerFn = useCallback(
    () => new Worker(new URL('../../workers/tesseract.worker.ts', import.meta.url), { type: 'module' }),
    [],
  );

  const { postMessage, terminate } = useWorker(createWorkerFn, {
    onProgress: (percent, stageMsg) => {
      setProgress(percent);
      setStage(stageMsg);
    },
    onResult: (data) => {
      const result = data as OcrData;
      setEditedText(result.text);
      setConfidence(result.confidence);
      wordBoxesRef.current = result.wordBoxes;
      setStatus('done');
      setProgress(100);
      setStage('Complete');

      dispatch({
        type: 'SET_OCR',
        payload: {
          text: result.text,
          engine,
          language,
          confidence: result.confidence,
          wordBoxes: result.wordBoxes,
        },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 2 });
    },
    onError: (message) => {
      setError(message);
      setStatus('error');
    },
  });

  const handleRun = useCallback(() => {
    if (!store.input?.previewUrl) return;

    setStatus('processing');
    setProgress(0);
    setStage('Starting...');
    setError(null);

    postMessage({
      type: 'PROCESS',
      payload: {
        imageUrl: store.input.previewUrl,
        language,
      },
    });
  }, [store.input?.previewUrl, language, postMessage]);

  const handleRetry = useCallback(() => {
    terminate();
    handleRun();
  }, [terminate, handleRun]);

  const handleTextEdit = useCallback(
    (text: string) => {
      setEditedText(text);
      dispatch({
        type: 'SET_OCR',
        payload: {
          text,
          engine,
          language,
          confidence,
          wordBoxes: wordBoxesRef.current,
        },
      });
    },
    [dispatch, engine, language, confidence],
  );

  const isProcessing = status === 'processing';

  return (
    <div>
      <StepHeader
        title="Optical Character Recognition"
        description="Extract text from your document using AI-powered OCR engines."
      />

      <div className="space-y-4">
        {/* Engine + Language selection */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <EngineSelector value={engine} onChange={setEngine} disabled={isProcessing} />
          </div>
          <LanguageSelector value={language} onChange={setLanguage} disabled={isProcessing} />
        </div>

        {/* Run button */}
        {status === 'idle' && (
          <button
            onClick={handleRun}
            className="w-full py-3 rounded-xl text-sm font-semibold gradient-accent text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all duration-200 cursor-pointer"
          >
            Run OCR
          </button>
        )}

        {/* Progress */}
        {isProcessing && <OcrProgress percent={progress} stage={stage} />}

        {/* Error */}
        {status === 'error' && error && (
          <div className="glass-surface rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-error">OCR Failed</p>
                <p className="text-[11px] text-dimmed mt-0.5">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-3 py-1 rounded-md text-[11px] font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-colors duration-200 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {status === 'done' && (
          <>
            <OcrResult
              text={editedText}
              confidence={confidence}
              onChange={handleTextEdit}
            />

            <button
              onClick={handleRun}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-dimmed border border-panel-border hover:text-surface hover:border-white/15 transition-all duration-200 cursor-pointer"
            >
              Re-run OCR
            </button>
          </>
        )}
      </div>
    </div>
  );
}
