import { useCallback, useState } from 'react';

// Standardises the loading/error/run pattern used by every form and button
// that calls the API, so each component only needs to describe *what* to run.
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, run, setError };
}
