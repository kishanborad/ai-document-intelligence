import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { DocStore, DocAction } from './types';
import { docReducer, initialState } from './reducer';

const DocStoreContext = createContext<DocStore>(initialState);
const DocDispatchContext = createContext<Dispatch<DocAction>>(() => {});

export function DocStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(docReducer, initialState);

  return (
    <DocStoreContext.Provider value={state}>
      <DocDispatchContext.Provider value={dispatch}>
        {children}
      </DocDispatchContext.Provider>
    </DocStoreContext.Provider>
  );
}

export function useDocStore(): DocStore {
  return useContext(DocStoreContext);
}

export function useDocDispatch(): Dispatch<DocAction> {
  return useContext(DocDispatchContext);
}
