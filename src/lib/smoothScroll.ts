import Lenis, { type LenisOptions } from 'lenis';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let lenis: Lenis | null = null;

export const smoothScrollOptions: LenisOptions = {
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.4,
  anchors: true,
  autoRaf: true,
};

export const shouldPreventSmoothScroll = (
  node: HTMLElement,
  root?: HTMLElement | Window
) => {
  if (
    node === root ||
    node === document.documentElement ||
    node === document.body ||
    node.hasAttribute('data-lenis-prevent')
  ) {
    return true;
  }

  const style = window.getComputedStyle(node);
  const isScrollable = /(auto|scroll)/.test(style.overflowY);

  return isScrollable && node.scrollHeight > node.clientHeight;
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

export function initSmoothScroll() {
  if (typeof window === 'undefined' || lenis || prefersReducedMotion()) {
    return lenis;
  }

  lenis = new Lenis({
    ...smoothScrollOptions,
    prevent: (node) => shouldPreventSmoothScroll(node),
  });

  return lenis;
}

export function destroySmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

export function scrollToTop(immediate = false) {
  if (lenis) {
    lenis.scrollTo(0, { immediate, force: true });
    return;
  }

  window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
}

export function scrollToElement(
  target: Element | string | number,
  options: { offset?: number; immediate?: boolean } = {}
) {
  const { offset = 0, immediate = false } = options;

  if (lenis) {
    lenis.scrollTo(target, { offset, immediate, force: true });
    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({
      top: target + offset,
      behavior: immediate ? 'auto' : 'smooth',
    });
    return;
  }

  const element =
    typeof target === 'string' ? document.querySelector(target) : target;

  if (!element) return;

  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY + offset,
    behavior: immediate ? 'auto' : 'smooth',
  });
}

export function getSmoothScroll() {
  return lenis;
}
