export function AuthEmailDivider({ label }: { label: string }) {
  return (
    <div className="relative py-5" role="separator" aria-label={label}>
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-border" />
      </div>
      <p className="relative flex justify-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span className="bg-card px-4">{label}</span>
      </p>
    </div>
  );
}
