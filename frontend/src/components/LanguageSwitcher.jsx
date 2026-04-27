import { t } from "../lib/i18n";

export function LanguageSwitcher({ language, setLanguage }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white/90 p-1">
      {["en", "hi"].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLanguage(value)}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            language === value ? "bg-[#b52130] text-white" : "text-slate-700"
          }`}
        >
          {t(language, value === "en" ? "english" : "hindi")}
        </button>
      ))}
    </div>
  );
}
