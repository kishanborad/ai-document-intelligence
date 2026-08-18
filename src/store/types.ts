export interface WordBox {
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entity {
  text: string;
  type: string;
  start: number;
  end: number;
  source: 'regex' | 'bert';
  confidence: number;
}

export interface CustomPattern {
  id: string;
  label: string;
  pattern: string;
}

export interface Classification {
  category: string;
  score: number;
  isCustom: boolean;
}

export interface CustomCategory {
  id: string;
  label: string;
  examples: string[];
}

export interface StepError {
  step: number;
  severity: 'blocking' | 'degraded';
  code: string;
  message: string;
  retryable: boolean;
  retry?: () => void;
}

export interface DocStore {
  input: {
    type: 'image' | 'pdf' | 'text';
    rawFile: File | null;
    rawText: string | null;
    previewUrl: string | null;
    pageCount: number;
  } | null;

  ocr: {
    text: string;
    engine: 'tesseract' | 'paddle';
    language: string;
    confidence: number;
    wordBoxes: WordBox[];
  } | null;

  ner: {
    entities: Entity[];
    customPatterns: CustomPattern[];
  } | null;

  classification: {
    results: Classification[];
    customCategories: CustomCategory[];
  } | null;

  activeStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  errors: StepError[];
}

export type DocAction =
  | { type: 'SET_INPUT'; payload: DocStore['input'] }
  | { type: 'SET_OCR'; payload: DocStore['ocr'] }
  | { type: 'SET_NER'; payload: DocStore['ner'] }
  | { type: 'SET_CLASSIFICATION'; payload: DocStore['classification'] }
  | { type: 'SET_STEP'; payload: DocStore['activeStep'] }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'ADD_ERROR'; payload: StepError }
  | { type: 'CLEAR_ERRORS'; payload: number }
  | { type: 'RESET' };
