import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't fight intentional in-page anchor scrolling (e.g. nav links that
    // jump to /#features from another page) — only reset when there's no
    // hash telling the page to scroll somewhere specific.
    if (hash) return;

    window.scrollTo(0, 0);

    // The student/admin dashboard layout scrolls inside its own .main
    // container rather than the window, and that container doesn't
    // unmount between routes — so it keeps its old scroll position
    // unless reset separately here.
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
  }, [pathname, hash]);

  return null;
};
