import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embedder: any = null;

interface EmbedMessage {
  type: 'EMBED';
  payload: {
    texts: string[];
    labels: string[];
  };
}

interface LoadMessage {
  type: 'LOAD_MODEL';
}

interface AbortMessage {
  type: 'ABORT';
}

type WorkerMessage = EmbedMessage | LoadMessage | AbortMessage;

async function loadModel() {
  if (embedder) return;

  self.postMessage({ type: 'PROGRESS', percent: 10, stage: 'Downloading embedding model (~23MB)...' });

  embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      progress_callback: (progress: { progress?: number; status?: string }) => {
        if (progress.progress !== undefined) {
          const percent = 10 + Math.round(progress.progress * 0.6);
          self.postMessage({ type: 'PROGRESS', percent, stage: progress.status ?? 'Downloading...' });
        }
      },
    },
  );

  self.postMessage({ type: 'PROGRESS', percent: 75, stage: 'Model ready' });
}

function meanPool(output: { data: Float32Array; dims: number[] }): number[] {
  const [, seqLen, hiddenSize] = output.dims;
  const result = new Array(hiddenSize).fill(0);

  for (let i = 0; i < seqLen; i++) {
    for (let j = 0; j < hiddenSize; j++) {
      result[j] += output.data[i * hiddenSize + j];
    }
  }

  for (let j = 0; j < hiddenSize; j++) {
    result[j] /= seqLen;
  }

  return result;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === 'ABORT') {
    embedder = null;
    return;
  }

  if (msg.type === 'LOAD_MODEL') {
    try {
      await loadModel();
      self.postMessage({ type: 'PROGRESS', percent: 80, stage: 'Embedding model loaded' });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        message: err instanceof Error ? err.message : 'Failed to load embedding model',
      });
    }
    return;
  }

  if (msg.type === 'EMBED') {
    try {
      await loadModel();

      const { texts, labels } = msg.payload;
      const embeddings: Record<string, number[]> = {};

      for (let i = 0; i < texts.length; i++) {
        const percent = 80 + Math.round((i / texts.length) * 18);
        self.postMessage({ type: 'PROGRESS', percent, stage: `Embedding ${i + 1}/${texts.length}...` });

        const output = await embedder(texts[i], { pooling: 'mean', normalize: true });

        // output might be a Tensor — extract data
        if (output.data && output.dims) {
          embeddings[labels[i]] = meanPool(output);
        } else if (Array.isArray(output)) {
          embeddings[labels[i]] = Array.from(output[0].data ?? output[0]);
        }
      }

      self.postMessage({ type: 'RESULT', data: embeddings });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        message: err instanceof Error ? err.message : 'Embedding failed',
      });
    }
  }
};
