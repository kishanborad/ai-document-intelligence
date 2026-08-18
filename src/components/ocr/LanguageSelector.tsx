interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'ita', label: 'Italian' },
  { code: 'por', label: 'Portuguese' },
  { code: 'hin', label: 'Hindi' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
  { code: 'kor', label: 'Korean' },
  { code: 'ara', label: 'Arabic' },
];

export default function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-dimmed font-medium">Language</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-white/5 border border-panel-border rounded-lg px-3 py-1.5 text-xs text-surface focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-panel-bg text-surface">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
