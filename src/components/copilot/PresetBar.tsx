interface PresetBarProps {
  onSelectPreset: (text: string) => void;
  loading: boolean;
}

export default function PresetBar({ onSelectPreset, loading }: PresetBarProps) {
  const presetQueries = [
    {
      label: 'Moroccan Crowd Spill',
      text: 'عباد بزاف هنا، كاين مخنق والناس عياو مقادينش نتنفسو، كاين لي طاح!',
    },
    { label: 'Medical Breathing Crisis', text: 'My mother cannot breathe and needs a restroom' },
    { label: 'Spanish Confusion', text: 'Many Spanish fans are confused near Gate C' },
    { label: 'Bin Overflow', text: 'Smart bin B-104 is overflowing near Gate C' },
    {
      label: 'Snack Stock Low',
      text: 'Concession stand World Cup Snacks is running low on water and snacks',
    },
  ];

  return (
    <div className="p-3 bg-slate-950/40 border-b border-slate-850 flex flex-wrap gap-2">
      {presetQueries.map((preset) => (
        <button
          type="button"
          key={preset.label}
          onClick={() => onSelectPreset(preset.text)}
          disabled={loading}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 text-[10px] font-semibold transition-colors duration-150"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
