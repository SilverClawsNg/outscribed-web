import { type TaleListDto } from '@/features/tales/types/TalesTypes';

interface CuratedHomepageLayout {
  focus: TaleListDto | null;
  subfocus: TaleListDto | null;
  sidebar: TaleListDto[];
  nones: TaleListDto[];
  subside: TaleListDto[];
  allNonesHaveImages: boolean; // Flag indicating if the entire nones strip is image-backed
}

export function curateHomepageTales(tales: TaleListDto[]): CuratedHomepageLayout {
  let pool = [...tales.slice(0, 10)];

  // 1. FOCUS (Must have image)
  const focusIndex = pool.findIndex(t => !!t.photo);
  let focus: TaleListDto | null = null;
  if (focusIndex !== -1) {
    const [selectedFocus] = pool.splice(focusIndex, 1);
    focus = selectedFocus ?? null;
  } else {
    focus = pool.shift() ?? null;
  }

  // 2. SUBFOCUS (Must have image)
  const subfocusIndex = pool.findIndex(t => !!t.photo);
  let subfocus: TaleListDto | null = null;
  if (subfocusIndex !== -1) {
    const [selectedSubfocus] = pool.splice(subfocusIndex, 1);
    subfocus = selectedSubfocus ?? null;
  } else {
    subfocus = pool.shift() ?? null;
  }

  // Helper for photo preference allocation
  const takeWithPhotoPreference = (count: number, sourcePool: TaleListDto[]): TaleListDto[] => {
    const result: TaleListDto[] = [];
    for (let i = 0; i < count; i++) {
      if (sourcePool.length === 0) break;
      const photoIdx = sourcePool.findIndex(t => !!t.photo);
      if (photoIdx !== -1) {
        const [selected] = sourcePool.splice(photoIdx, 1);
        const next = selected ?? sourcePool.shift();
        if (next) {
          result.push(next);
        }
      } else {
        const next = sourcePool.shift();
        if (next) {
          result.push(next);
        }
      }
    }
    return result;
  };

  // 3. SIDEBAR (Prefers images)
  const sidebar = takeWithPhotoPreference(3, pool);

  // 4. SUB-SIDEBARS (Prefers images)
  const subside = takeWithPhotoPreference(2, pool);

  // 5. NONES (Remaining 3 items)
  let nones = pool.splice(0, 3);

  // --- ALL-OR-NOTHING SYMMETRY RULE FOR NONES ---
  const allNonesHaveImages = nones.length > 0 && nones.every(t => !!t.photo);

  if (!allNonesHaveImages) {
    // If false (1, 2, or all 3 lack images), strip photos from all nones for strict symmetry
    // Keep photo as an empty string so it still matches TaleListDto's string type while behaving as "no image".
    nones = nones.map(t => ({ ...t, photo: '' }));
  }

  return { focus, subfocus, sidebar, nones, subside, allNonesHaveImages };
}