'use client';

interface ConcessionMarkerProps {
  id: string;
  cx: number;
  cy: number;
  fill: string;
  stock?: number;
  queue?: number;
  isSelected?: boolean;
}

export function ConcessionMarker({ cx, cy, fill }: ConcessionMarkerProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="2.5" fill={fill} stroke="#0f172a" strokeWidth="0.5" />
      <text x={cx} y={cy + 1.2} fill="#0f172a" fontSize="3" fontWeight="bold" textAnchor="middle">
        C
      </text>
    </g>
  );
}
