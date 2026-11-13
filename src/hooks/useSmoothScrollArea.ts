import Lenis from 'lenis';
import { useEffect, useRef } from 'react';
import {
  prefersReducedMotion,
  shouldPreventSmoothScroll,
  smoothScrollOptions,
} from '../lib/smoothScroll';

export function useSmoothScrollArea<T extends HTMLElement>(
  deps: readonly unknown[] = []
) {
  const wrapperRef = useRef<T>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = wrapper?.firstElementChild;

    if (
      !wrapper ||
      !(content instanceof HTMLElement) ||
      prefersReducedMotion()
    ) {
      return;
    }

    const lenis = new Lenis({
      ...smoothScrollOptions,
      wrapper,
      content,
      prevent: (node) => shouldPreventSmoothScroll(node, wrapper),
    });

    return () => lenis.destroy();
  }, deps);

  return wrapperRef;
}
