import { useCallback, useEffect, useRef, useState } from "react";

// Runs an async function on mount / when deps change, optionally polling.
// Polling refreshes are silent: existing data stays visible if a refresh fails.
export function useAsync(fn, deps = [], { interval } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const seq = useRef(0);

  const run = useCallback(async (silent) => {
    const id = ++seq.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (id === seq.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === seq.current) setState((s) => ({ data: silent ? s.data : null, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    run(false);
    if (!interval) return undefined;
    const t = setInterval(() => run(true), interval);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, interval, run]);

  return { ...state, reload: () => run(false), refresh: () => run(true) };
}
