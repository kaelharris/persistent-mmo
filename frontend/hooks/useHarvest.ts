import { useEffect, useRef, useState } from 'react';

type HarvestResult = { success: boolean; error: string | null; gatheredQuantity: number; experienceGained: number };

export function useHarvest(
  gather: (resourceId: number) => Promise<HarvestResult>,
  onComplete: (result: HarvestResult, resourceId: number) => void,
) {
  const [activeGatherId, setActiveGatherId] = useState<number | null>(null);
  const [gatherProgress, setGatherProgress] = useState(0);
  const busy = useRef(false);
  const progress = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (timer.current) clearInterval(timer.current); };
  }, []);

  const startGather = (resourceId: number, durationSeconds: number) => {
    if (busy.current) return;
    busy.current = true;
    progress.current = 0;
    setActiveGatherId(resourceId);
    setGatherProgress(0);
    timer.current = setInterval(async () => {
      progress.current = Math.min(100, progress.current + 100 / Math.max(1, durationSeconds * 10));
      setGatherProgress(progress.current);
      if (progress.current < 100) return;
      clearInterval(timer.current!);
      timer.current = null;
      try {
        const result = await gather(resourceId);
        if (mounted.current) onComplete(result, resourceId);
      } catch (error) {
        if (mounted.current) onComplete({ success: false, error: error instanceof Error ? error.message : 'Harvest failed.', gatheredQuantity: 0, experienceGained: 0 }, resourceId);
      } finally {
        busy.current = false;
        if (mounted.current) setActiveGatherId(null);
      }
    }, 100);
  };

  const boostHarvest = () => {
    if (!busy.current || !timer.current) return;
    progress.current = Math.min(100, progress.current + 25);
    setGatherProgress(progress.current);
  };

  return { activeGatherId, gatherProgress, startGather, boostHarvest };
}
