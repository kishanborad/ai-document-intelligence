import { DocStoreProvider } from './store/DocStoreContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import WizardShell from './components/shell/WizardShell';

export default function App() {
  return (
    <DocStoreProvider>
      <div className="h-screen flex flex-col bg-panel-bg text-surface">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-panel-border bg-panel-surface backdrop-blur-[12px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shadow-glow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-surface to-surface-dim bg-clip-text text-transparent">
              AI Document Intelligence
            </h1>
          </div>
          <span className="text-xs text-dimmed tracking-wide">
            OCR &middot; NER &middot; Classification &mdash; 100% client-side
          </span>
        </header>

        {/* Wizard */}
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <WizardShell />
          </ErrorBoundary>
        </main>
      </div>
    </DocStoreProvider>
  );
}
