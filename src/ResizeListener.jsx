import { useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export default (props) => {
  useEffect(() => {
    const element = props.resizeListenerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }

      props.handleResize();
    });

    resizeObserver.observe(element);

    return () => resizeObserver.unobserve(element);
  });

  return null;
};
