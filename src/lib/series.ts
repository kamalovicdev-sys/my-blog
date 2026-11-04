import type { SeriesInfo } from './posts';

// "Part 1 of 2". Qism raqami berilmagan bo'lsa shunchaki "Series"
export function seriesLabel(series: SeriesInfo) {
  if (!series.part) return 'Series';
  return series.total > 1 ? `Part ${series.part} of ${series.total}` : `Part ${series.part}`;
}
