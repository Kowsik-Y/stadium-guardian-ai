import { memo } from 'react';
import { getDensityColor } from '@/lib/mapVisuals';

interface BinMarkerProps {
  id: string;
  x: number;
  y: number;
  fillLevel?: number;
  isSelected?: boolean;
}

export const BinMarker = memo(function BinMarker({ x, y, fillLevel = 0 }: BinMarkerProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="3.2"
        height="4.2"
        rx="0.6"
        fill={getDensityColor(fillLevel, 85, 55)}
        stroke="#0f172a"
        strokeWidth="0.5"
      />
      <text
        x={x + 1.6}
        y={y + 3.2}
        fill="#0f172a"
        fontSize="1.8"
        fontWeight="bold"
        textAnchor="middle"
      >
        B
      </text>
    </g>
  );
});
