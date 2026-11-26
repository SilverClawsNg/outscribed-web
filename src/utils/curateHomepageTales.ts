import { type TaleListDto } from '@/features/tales/types/TalesTypes';

interface CuratedHomepageLayout {
  focus: TaleListDto | null;        // Level 1: Full-width hero ('a')
  nones: TaleListDto[];             // Level 2: 4-column symmetry strip ('b, c, d, f')
  subfocus: TaleListDto | null;     // Level 3 Left: 2-column anchor ('h')
  subside: TaleListDto[];           // Level 3 Right: 2x2 grid of 4 cards ('e, g, i, j')
  allNonesHaveImages: boolean;
}

export function curateHomepageTales(tales: TaleListDto[]): CuratedHomepageLayout {
  // Pool of top 12 candidates to fill 10 total homepage slots (1 + 6 + 1 + 2)
  let pool = [...tales.slice(0, 12)];

  const takeWithPhotoPreference = (count: number, sourcePool: TaleListDto[]): TaleListDto[] => {
    const result: TaleListDto[] = [];
    for (let i = 0; i < count; i++) {
      if (sourcePool.length === 0) break;
      const photoIdx = sourcePool.findIndex(t => !!t.photo);
      if (photoIdx !== -1) {
        const [selected] = sourcePool.splice(photoIdx, 1);
        if (selected) result.push(selected);
      } else {
        const next = sourcePool.shift();
        if (next) result.push(next);
      }
    }
    return result;
  };

  // 1. FOCUS (Level 1 - Must have image if available)
  const focusIndex = pool.findIndex(t => !!t.photo);
  let focus: TaleListDto | null = null;
  if (focusIndex !== -1) {
    const [selectedFocus] = pool.splice(focusIndex, 1);
    focus = selectedFocus ?? null;
  } else {
    focus = pool.shift() ?? null;
  }

  // 2. NONES (Level 2 - 4 items with All-or-Nothing image symmetry)
  let nones = takeWithPhotoPreference(6, pool);
  const allNonesHaveImages = nones.length > 0 && nones.every(t => !!t.photo);

  if (!allNonesHaveImages && nones.length > 0) {
    nones = nones.map(t => ({ ...t, photo: '' }));
  }

  // 3. SUBFOCUS (Level 3 Left - Must have image if available)
  const subfocusIndex = pool.findIndex(t => !!t.photo);
  let subfocus: TaleListDto | null = null;
  if (subfocusIndex !== -1) {
    const [selectedSubfocus] = pool.splice(subfocusIndex, 1);
    subfocus = selectedSubfocus ?? null;
  } else {
    subfocus = pool.shift() ?? null;
  }

  // 4. SUBSIDE (Level 3 Right - 4 cards arranged in a 2x2 two-level grid)
  const subside = takeWithPhotoPreference(2, pool);

  return {
    focus,
    nones,
    subfocus,
    subside,
    allNonesHaveImages,
  };
}