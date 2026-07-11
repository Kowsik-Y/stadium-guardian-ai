'use client';

import { getDensityColor } from '@/lib/mapVisuals';

interface GateMarkerProps {
  id: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  density: number;
  waitTime: number;
  isSelected?: boolean; // Reserved for potential future styling when selected
  onSelect: (gate: string) => void;
}

export function GateMarker({
  id,
  cx,
  cy,
  labelX,
  labelY,
  density,
  waitTime,
  onSelect,
}: GateMarkerProps) {
  return (
    <g>
      {/* biome-ignore lint/a11y/useSemanticElements: SVG <circle> has no HTML semantic equivalent; role=button + tabIndex + onKeyDown provides keyboard access */}
      <circle
        cx={cx}
        cy={cy}
        r="5"
        fill={getDensityColor(density, 80, 50)}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onSelect(id)}
        role="button"
        tabIndex={0}
        aria-label={`${id} — density ${density}%, wait ${waitTime} min`}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(id)}
      >
        <title>
          {id} — {density}% density
        </title>
      </circle>
      <text x={labelX} y={labelY} fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle">
        {id}
      </text>
    </g>
  );
}
