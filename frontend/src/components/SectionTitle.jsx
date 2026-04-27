export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      <p className="text-sm uppercase tracking-[0.25em] text-moss">{eyebrow}</p>
      <h3 className="mt-2 font-display text-2xl text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}
