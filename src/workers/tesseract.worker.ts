import { createWorker, type Worker as TessWorker } from 'tesseract.js';

let worker: TessWorker | null = null;

interface ProcessMessage {
  type: 'PROCESS';
  payload: {
    imageUrl: string;
    language: string;
  };
}

interface AbortMessage {
  type: 'ABORT';
}

type WorkerMessage = ProcessMessage | AbortMessage;

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === 'ABORT') {
    if (worker) {
      await worker.terminate();
      worker = null;
    }
    return;
  }

  if (msg.type === 'PROCESS') {
    const { imageUrl, language } = msg.payload;

    try {
      self.postMessage({ type: 'PROGRESS', percent: 5, stage: 'Initializing OCR engine...' });

      if (!worker) {
        worker = await createWorker(language, undefined, {
          logger: (info: { status: string; progress: number }) => {
            let percent = 10;
            if (info.status === 'loading tesseract core') percent = 15;
            else if (info.status === 'initializing tesseract') percent = 25;
            else if (info.status === 'loading language traineddata') percent = 35;
            else if (info.status === 'initializing api') percent = 50;
            else if (info.status === 'recognizing text') percent = 55 + Math.round(info.progress * 40);

            self.postMessage({ type: 'PROGRESS', percent, stage: info.status });
          },
        });
      } else {
        await worker.reinitialize(language);
      }

      self.postMessage({ type: 'PROGRESS', percent: 55, stage: 'Recognizing text...' });

      const result = await worker.recognize(imageUrl);

      const wordBoxes = result.data.words?.map((w) => ({
        text: w.text,
        confidence: w.confidence / 100,
        x: w.bbox.x0,
        y: w.bbox.y0,
        width: w.bbox.x1 - w.bbox.x0,
        height: w.bbox.y1 - w.bbox.y0,
      })) ?? [];

      self.postMessage({
        type: 'RESULT',
        data: {
          text: result.data.text,
          confidence: result.data.confidence / 100,
          wordBoxes,
        },
      });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        message: err instanceof Error ? err.message : 'OCR processing failed',
      });
    }
  }
};
