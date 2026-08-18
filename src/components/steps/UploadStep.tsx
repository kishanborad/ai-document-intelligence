import { useState, useCallback } from 'react';
import StepHeader from '../shell/StepHeader';
import DropZone from '../upload/DropZone';
import TextPasteArea from '../upload/TextPasteArea';
import FilePreview from '../upload/FilePreview';
import { useDocStore, useDocDispatch } from '../../store/DocStoreContext';

type InputMode = 'file' | 'text';

export default function UploadStep() {
  const store = useDocStore();
  const dispatch = useDocDispatch();
  const [mode, setMode] = useState<InputMode>('file');

  const hasInput = store.input !== null;

  const handleFile = useCallback(
    async (file: File) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');
      const type = isPdf ? 'pdf' as const : 'image' as const;

      let previewUrl: string | null = null;
      let pageCount = 1;

      if (isImage) {
        previewUrl = URL.createObjectURL(file);
      } else if (isPdf) {
        previewUrl = URL.createObjectURL(file);
        try {
          const pdfjs = await import('pdfjs-dist');
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
          ).toString();
          const doc = await pdfjs.getDocument(previewUrl).promise;
          pageCount = doc.numPages;
        } catch {
          // PDF page count detection failed — default to 1
        }
      }

      dispatch({
        type: 'SET_INPUT',
        payload: { type, rawFile: file, rawText: null, previewUrl, pageCount },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 1 });
    },
    [dispatch],
  );

  const handleText = useCallback(
    (text: string) => {
      dispatch({
        type: 'SET_INPUT',
        payload: { type: 'text', rawFile: null, rawText: text, previewUrl: null, pageCount: 0 },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 1 });
    },
    [dispatch],
  );

  const handleRemove = useCallback(() => {
    if (store.input?.previewUrl) {
      URL.revokeObjectURL(store.input.previewUrl);
    }
    dispatch({ type: 'RESET' });
  }, [dispatch, store.input?.previewUrl]);

  return (
    <div>
      <StepHeader
        title="Upload Document"
        description="Upload an image or PDF, or paste text directly to analyze."
      />

      {/* Mode toggle */}
      {!hasInput && (
        <div className="flex gap-1 mb-5 p-0.5 rounded-lg bg-white/5 w-fit">
          <button
            onClick={() => setMode('file')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
              mode === 'file'
                ? 'gradient-accent text-white shadow-glow'
                : 'text-dimmed hover:text-surface'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
              mode === 'text'
                ? 'gradient-accent text-white shadow-glow'
                : 'text-dimmed hover:text-surface'
            }`}
          >
            Paste Text
          </button>
        </div>
      )}

      {/* Content */}
      {hasInput && store.input ? (
        store.input.type === 'text' ? (
          <div className="glass-surface rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface">Pasted Text</p>
                <p className="text-[11px] text-dimmed mt-0.5">
                  {store.input.rawText?.length} characters
                </p>
                <p className="text-xs text-dimmed/70 mt-2 line-clamp-3 font-mono">
                  {store.input.rawText}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-success">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Ready — OCR will be skipped
                  </div>
                </div>
                <button
                  onClick={handleRemove}
                  className="mt-3 px-3 py-1 rounded-md text-[11px] text-dimmed border border-panel-border hover:text-error hover:border-error/30 transition-colors duration-200 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <FilePreview
            file={store.input.rawFile!}
            previewUrl={store.input.previewUrl}
            pageCount={store.input.pageCount}
            onRemove={handleRemove}
          />
        )
      ) : mode === 'file' ? (
        <DropZone onFile={handleFile} />
      ) : (
        <TextPasteArea onText={handleText} />
      )}
    </div>
  );
}
