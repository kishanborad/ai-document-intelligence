import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { DocStore } from '../store/types';
import { buildExportPayload } from './exportJson';
import { buildAnnotatedText } from './exportAnnotatedText';

/**
 * Bundle all analysis results into a ZIP file.
 * Includes: results.json, annotated-report.txt, and original file (if any).
 */
export async function downloadZip(store: DocStore) {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const folderName = `doc-intelligence-${timestamp}`;
  const folder = zip.folder(folderName)!;

  // JSON results
  const payload = buildExportPayload(store);
  folder.file('results.json', JSON.stringify(payload, null, 2));

  // Annotated text report
  const text = store.ocr?.text ?? store.input?.rawText ?? '';
  const entities = store.ner?.entities ?? [];
  const classifications = store.classification?.results ?? [];
  const report = buildAnnotatedText(text, entities, classifications);
  folder.file('annotated-report.txt', report);

  // OCR raw text
  if (store.ocr?.text) {
    folder.file('ocr-text.txt', store.ocr.text);
  }

  // Entities CSV
  if (entities.length > 0) {
    const csvLines = ['text,type,source,confidence,start,end'];
    for (const e of entities) {
      const escaped = e.text.replace(/"/g, '""');
      csvLines.push(`"${escaped}","${e.type}","${e.source}",${e.confidence.toFixed(3)},${e.start},${e.end}`);
    }
    folder.file('entities.csv', csvLines.join('\n'));
  }

  // Original file
  if (store.input?.rawFile) {
    const arrayBuffer = await store.input.rawFile.arrayBuffer();
    folder.file(`original-${store.input.rawFile.name}`, arrayBuffer);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${folderName}.zip`);
}
