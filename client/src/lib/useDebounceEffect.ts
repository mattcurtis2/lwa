
import { useEffect, DependencyList } from 'react';

// Custom hook to debounce effects
export function useDebounceEffect(
  fn: () => void,
  deps: DependencyList,
  delay = 300
) {
  useEffect(() => {
    const handler = setTimeout(() => {
      fn();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

export default useDebounceEffect;
