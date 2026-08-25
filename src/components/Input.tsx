type InputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  type?: "text" | "number" | "time" | "date";
  className?: string;
};

export function Input({
  value,
  onChange,
  placeholder,
  label,
  type = "text",
  className = "",
}: InputProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="mb-1.5 block text-sm text-text-secondary">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-text outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
