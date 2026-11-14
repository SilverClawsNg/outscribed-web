import { type TaleListDto } from '@/features/tales/types/TalesTypes';

interface CuratedHomepageLayout {
  focus: TaleListDto | null;        // 'a'
  subfocus: TaleListDto | null;     // 'h'
  sidebar: TaleListDto | null;      // 'e' (Top Level sidebar card)
  nones: TaleListDto[];             // 'b, c, d, f' (Level 2: Exactly 4 items for grid symmetry)
  subside: TaleListDto[];           // 'i, j' (Level 3 Stack items)
  sideCard: TaleListDto | null;     // 'g' (Level 3 Rightmost card)
  allNonesHaveImages: boolean;      // Flag indicating if the entire Level 2 nones strip is image-backed
}

export function curateHomepageTales(tales: TaleListDto[]): CuratedHomepageLayout {
  // Grab a working pool of top candidates (expanded to support 9 slotted items)
  let pool = [...tales.slice(0, 12)];

  // Helper for photo preference allocation
  const takeWithPhotoPreference = (count: number, sourcePool: TaleListDto[]): TaleListDto[] => {
    const result: TaleListDto[] = [];
    for (let i = 0; i < count; i++) {
      if (sourcePool.length === 0) break;
      const photoIdx = sourcePool.findIndex(t => !!t.photo);
      if (photoIdx !== -1) {
        const [selected] = sourcePool.splice(photoIdx, 1);
        if (selected) {
          result.push(selected);
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

  // 1. FOCUS (Level 1 'a' - Must have image if available)
  const focusIndex = pool.findIndex(t => !!t.photo);
  let focus: TaleListDto | null = null;
  if (focusIndex !== -1) {
    const [selectedFocus] = pool.splice(focusIndex, 1);
    focus = selectedFocus ?? null;
  } else {
    focus = pool.shift() ?? null;
  }

  // 2. SIDEBAR (Level 1 'e' - Prefers images)
  const sidebarArr = takeWithPhotoPreference(1, pool);
  const sidebar = sidebarArr[0] ?? null;

  // 3. NONES (Level 2 'b, c, d, f' - Exactly 4 items required for the 4-column grid row)
  let nones = takeWithPhotoPreference(4, pool);

  // --- ALL-OR-NOTHING SYMMETRY RULE FOR LEVEL 2 NONES ---
  const allNonesHaveImages = nones.length > 0 && nones.every(t => !!t.photo);

  if (!allNonesHaveImages && nones.length > 0) {
    // If any item lacks an image, strip photos from all nones for strict layout symmetry
    nones = nones.map(t => ({ ...t, photo: '' }));
  }

  // 4. SUBFOCUS (Level 3 'h' - Must have image if available)
  const subfocusIndex = pool.findIndex(t => !!t.photo);
  let subfocus: TaleListDto | null = null;
  if (subfocusIndex !== -1) {
    const [selectedSubfocus] = pool.splice(subfocusIndex, 1);
    subfocus = selectedSubfocus ?? null;
  } else {
    subfocus = pool.shift() ?? null;
  }

  // 5. SUB-SIDEBAR / STACK (Level 3 'i, j' - Prefers images)
  const subside = takeWithPhotoPreference(2, pool);

  // 6. SIDE CARD (Level 3 'g' - Rightmost card matching level 1 'e' alignment)
  const sideCardArr = takeWithPhotoPreference(1, pool);
  const sideCard = sideCardArr[0] ?? null;

  return { 
    focus, 
    subfocus, 
    sidebar, 
    nones, 
    subside, 
    sideCard, 
    allNonesHaveImages 
  };
}