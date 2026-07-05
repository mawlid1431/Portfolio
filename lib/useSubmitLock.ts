"use client";

import { useCallback, useRef, useState } from "react";

/** Prevents duplicate submissions while an async save is in flight. */
export function useSubmitLock() {
  const [loading, setLoading] = useState(false);
  const lockRef = useRef(false);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (lockRef.current) return undefined;
    lockRef.current = true;
    setLoading(true);
    try {
      return await fn();
    } finally {
      lockRef.current = false;
      setLoading(false);
    }
  }, []);

  return { loading, run, isLocked: loading };
}
