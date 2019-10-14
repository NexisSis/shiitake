import { useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import PropTypes from 'prop-types';

let observerStarted = true;
const ResizeListener = (props) => {
  useEffect(() => {
    const element = props.resizeListenerRef.current;
    // skip first render
    const resizeObserver = new ResizeObserver((entries) => {
      if (observerStarted) {
        observerStarted = false;
        return;
      }

      if ((!Array.isArray(entries) || !entries.length)) {
        return;
      }
      props.handleResize();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
      observerStarted = true;
    };
  });

  return null;
};

ResizeListener.propTypes = {
  handleResize: PropTypes.func.isRequired,
  resizeListenerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
};

export default ResizeListener;
