type SwitchProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
};

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-surface-3"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}
