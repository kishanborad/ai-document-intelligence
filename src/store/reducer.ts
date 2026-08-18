import type { DocStore, DocAction } from './types';

export const initialState: DocStore = {
  input: null,
  ocr: null,
  ner: null,
  classification: null,
  activeStep: 1,
  completedSteps: [],
  errors: [],
};

export function docReducer(state: DocStore, action: DocAction): DocStore {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        input: action.payload,
        ocr: null,
        ner: null,
        classification: null,
        completedSteps: [],
        errors: [],
      };

    case 'SET_OCR':
      return {
        ...state,
        ocr: action.payload,
        ner: null,
        classification: null,
        completedSteps: state.completedSteps.filter((s) => s < 2),
      };

    case 'SET_NER':
      return {
        ...state,
        ner: action.payload,
        classification: null,
        completedSteps: state.completedSteps.filter((s) => s < 3),
      };

    case 'SET_CLASSIFICATION':
      return {
        ...state,
        classification: action.payload,
      };

    case 'SET_STEP':
      return { ...state, activeStep: action.payload };

    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.payload)
          ? state.completedSteps
          : [...state.completedSteps, action.payload],
      };

    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload],
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: state.errors.filter((e) => e.step !== action.payload),
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}
