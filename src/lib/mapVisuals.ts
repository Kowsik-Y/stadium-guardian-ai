export type WayfindingPreset = 'none' | 'crowd-spill' | 'concourse-b-bypass';

export function getDensityColor(
  value: number | undefined,
  criticalThreshold: number,
  warningThreshold: number,
): string {
  if (value === undefined) return '#10b981';
  if (value > criticalThreshold) return '#ef4444';
  if (value > warningThreshold) return '#f59e0b';
  return '#10b981';
}

export const GATE_LAYOUT = [
  { id: 'Gate A', cx: 30, cy: 25, labelX: 30, labelY: 17 },
  { id: 'Gate B', cx: 70, cy: 25, labelX: 70, labelY: 17 },
  { id: 'Gate C', cx: 30, cy: 75, labelX: 30, labelY: 85 },
  { id: 'Gate D', cx: 70, cy: 75, labelX: 70, labelY: 85 },
];

export const BIN_LAYOUT = [
  { id: 'B-101', x: 21, y: 28 },
  { id: 'B-102', x: 76, y: 28 },
  { id: 'B-103', x: 15, y: 73 },
  { id: 'B-104', x: 37, y: 73 },
  { id: 'B-201', x: 76, y: 67 },
  { id: 'B-211', x: 48, y: 14 },
];

export const CONCESSION_LAYOUT = [
  { id: 'C-1', cx: 21, cy: 40, fill: '#f59e0b' },
  { id: 'C-2', cx: 78, cy: 40, fill: '#f59e0b' },
  { id: 'C-3', cx: 21, cy: 62, fill: '#ef4444' }, // currently hardcoded red in MapWrapper
  { id: 'C-4', cx: 78, cy: 62, fill: '#f59e0b' },
];

export function getRedirectPathConfig(from: string, to: string) {
  if (from === 'Gate C' && to === 'Gate D') {
    return { x1: 30, y1: 75, x2: 70, y2: 75, label: 'Redirect C➔D' };
  }
  if (from === 'Gate A' && to === 'Gate C') {
    return { x1: 30, y1: 25, x2: 30, y2: 75, label: 'Redirect A➔C' };
  }
  if (from === 'Gate B' && to === 'Gate D') {
    return { x1: 70, y1: 25, x2: 70, y2: 75, label: 'Redirect B➔D' };
  }
  return { x1: 30, y1: 75, x2: 70, y2: 75, label: 'Redirect C➔D' };
}

export function getMedicalBadgePosition(text: string) {
  const t = text.toLowerCase();
  if (t.includes('gate c')) return { x: 30, y: 63, label: 'MED C' };
  if (t.includes('gate a')) return { x: 30, y: 37, label: 'MED A' };
  if (t.includes('gate b')) return { x: 70, y: 37, label: 'MED B' };
  if (t.includes('gate d')) return { x: 70, y: 63, label: 'MED D' };
  return { x: 50, y: 50, label: 'MED CONCOURSE' };
}
