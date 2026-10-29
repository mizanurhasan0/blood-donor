"use client";

import { useEffect, useState } from "react";

export const DISTRICT_ROTATION_INTERVAL = 3_000;

/** Choose a different district without retry loops or a bias toward adjacent districts. */
export function nextDistrictIndex(count: number, current: number | null, random: number) {
  if (count === 0) return null;
  if (count === 1) return 0;
  if (current === null || current < 0 || current >= count) return Math.floor(random * count);

  const next = Math.floor(random * (count - 1));
  return next >= current ? next + 1 : next;
}

export function useDistrictRotation(count: number, paused: boolean) {
  // Keep the server render deterministic; select randomly only after hydration.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    function selectNext() {
      const random = Math.random();
      setActiveIndex((current) => nextDistrictIndex(count, current, random));
    }

    function stop() {
      clearInterval(interval);
      interval = undefined;
    }

    function start() {
      stop();
      if (paused || document.hidden || count === 0) return;
      interval = setInterval(selectNext, DISTRICT_ROTATION_INTERVAL);
    }

    const initialSelection = setTimeout(() => {
      if (paused || document.hidden) return;
      const random = Math.random();
      setActiveIndex((current) => current ?? nextDistrictIndex(count, null, random));
    }, 0);

    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      stop();
      clearTimeout(initialSelection);
      document.removeEventListener("visibilitychange", start);
    };
  }, [count, paused]);

  return [activeIndex, setActiveIndex] as const;
}
