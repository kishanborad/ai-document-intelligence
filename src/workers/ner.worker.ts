import { pipeline, env, type TokenClassificationPipeline } from '@huggingface/transformers';

// Disable local model caching checks (use browser cache)
env.allowLocalModels = false;

let nerPipeline: TokenClassificationPipeline | null = null;

const LABEL_MAP: Record<string, string> = {
  'B-PER': 'Person',
  'I-PER': 'Person',
  'B-ORG': 'Organization',
  'I-ORG': 'Organization',
  'B-LOC': 'Location',
  'I-LOC': 'Location',
  'B-MISC': 'Misc',
  'I-MISC': 'Misc',
};

interface ProcessMessage {
  type: 'PROCESS';
  payload: {
    chunks: { chunk: string; offset: number }[];
  };
}

interface LoadMessage {
  type: 'LOAD_MODEL';
}

interface AbortMessage {
  type: 'ABORT';
}

type WorkerMessage = ProcessMessage | LoadMessage | AbortMessage;

interface RawNerResult {
  word: string;
  entity: string;
  score: number;
  start: number;
  end: number;
}

async function loadModel() {
  if (nerPipeline) return;

  self.postMessage({ type: 'PROGRESS', percent: 10, stage: 'Downloading NER model (~50MB)...' });

  // @ts-expect-error — Transformers.js pipeline() overloads produce union too complex for TS
  nerPipeline = await pipeline(
    'token-classification',
    'Xenova/bert-base-NER',
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

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === 'ABORT') {
    nerPipeline = null;
    return;
  }

  if (msg.type === 'LOAD_MODEL') {
    try {
      await loadModel();
      self.postMessage({ type: 'PROGRESS', percent: 80, stage: 'Model loaded — ready to process' });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        message: err instanceof Error ? err.message : 'Failed to load NER model',
      });
    }
    return;
  }

  if (msg.type === 'PROCESS') {
    try {
      await loadModel();

      self.postMessage({ type: 'PROGRESS', percent: 80, stage: 'Running NER inference...' });

      const allEntities: {
        text: string;
        type: string;
        start: number;
        end: number;
        confidence: number;
      }[] = [];

      const { chunks } = msg.payload;

      for (let i = 0; i < chunks.length; i++) {
        const { chunk, offset } = chunks[i];
        const percent = 80 + Math.round((i / chunks.length) * 18);
        self.postMessage({ type: 'PROGRESS', percent, stage: `Processing chunk ${i + 1}/${chunks.length}...` });

        const results = await nerPipeline!(chunk) as RawNerResult[];

        // Group B- and I- tokens into full entities
        let currentEntity: { text: string; type: string; start: number; end: number; scores: number[] } | null = null;

        for (const token of results) {
          const mappedType = LABEL_MAP[token.entity];
          if (!mappedType) {
            if (currentEntity) {
              allEntities.push({
                text: currentEntity.text,
                type: currentEntity.type,
                start: currentEntity.start + offset,
                end: currentEntity.end + offset,
                confidence: currentEntity.scores.reduce((a, b) => a + b, 0) / currentEntity.scores.length,
              });
              currentEntity = null;
            }
            continue;
          }

          const isBegin = token.entity.startsWith('B-');

          if (isBegin || !currentEntity || mappedType !== currentEntity.type) {
            // Save previous entity
            if (currentEntity) {
              allEntities.push({
                text: currentEntity.text,
                type: currentEntity.type,
                start: currentEntity.start + offset,
                end: currentEntity.end + offset,
                confidence: currentEntity.scores.reduce((a, b) => a + b, 0) / currentEntity.scores.length,
              });
            }
            // Start new entity
            currentEntity = {
              text: token.word.replace(/^##/, ''),
              type: mappedType,
              start: token.start,
              end: token.end,
              scores: [token.score],
            };
          } else {
            // Continue current entity
            const tokenText = token.word.startsWith('##')
              ? token.word.slice(2)
              : ' ' + token.word;
            currentEntity.text += tokenText;
            currentEntity.end = token.end;
            currentEntity.scores.push(token.score);
          }
        }

        // Don't forget the last entity
        if (currentEntity) {
          allEntities.push({
            text: currentEntity.text,
            type: currentEntity.type,
            start: currentEntity.start + offset,
            end: currentEntity.end + offset,
            confidence: currentEntity.scores.reduce((a, b) => a + b, 0) / currentEntity.scores.length,
          });
        }
      }

      self.postMessage({ type: 'RESULT', data: allEntities });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        message: err instanceof Error ? err.message : 'NER processing failed',
      });
    }
  }
};
