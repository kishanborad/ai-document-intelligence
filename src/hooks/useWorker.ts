import { useRef, useCallback, useEffect } from 'react';

interface WorkerProgress {
  type: 'PROGRESS';
  percent: number;
  stage: string;
}

interface WorkerResult {
  type: 'RESULT';
  data: unknown;
}

interface WorkerError {
  type: 'ERROR';
  message: string;
}

type WorkerEvent = WorkerProgress | WorkerResult | WorkerError;

interface UseWorkerOptions {
  onProgress?: (percent: number, stage: string) => void;
  onResult?: (data: unknown) => void;
  onError?: (message: string) => void;
}

export function useWorker(
  createWorkerFn: () => Worker,
  options: UseWorkerOptions,
) {
  const workerRef = useRef<Worker | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      const w = createWorkerFn();
      w.onmessage = (e: MessageEvent<WorkerEvent>) => {
        const msg = e.data;
        if (msg.type === 'PROGRESS') {
          optionsRef.current.onProgress?.(msg.percent, msg.stage);
        } else if (msg.type === 'RESULT') {
          optionsRef.current.onResult?.(msg.data);
        } else if (msg.type === 'ERROR') {
          optionsRef.current.onError?.(msg.message);
        }
      };
      w.onerror = () => {
        optionsRef.current.onError?.('Worker crashed unexpectedly');
      };
      workerRef.current = w;
    }
    return workerRef.current;
  }, [createWorkerFn]);

  const postMessage = useCallback(
    (msg: unknown) => {
      getWorker().postMessage(msg);
    },
    [getWorker],
  );

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { postMessage, terminate };
}
