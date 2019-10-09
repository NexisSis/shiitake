/**
 * @class ResizeListener
 * @description extendable component that uses the provided .handleResize() method
 */

/* eslint-env browser */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const defaultThrottleRate = 200;

const ResizeListener = (props) => {
  const [_resizeTimer, setResizeTimer] = useState(false);
  const [_pendingResize, setPendingResize] = useState(false);

  useEffect(() => {
    const _handleResize = () => {
      if (!_resizeTimer) {
        props.handleResize();
        // throttle the listener
         setResizeTimer(setTimeout(() => {
          // if a resize came in while we paused, adjust again once after the pause before we start listening again
          if (_pendingResize) {
            props.handleResize();
          }
          setResizeTimer(false);
        }, props.throttleRate));
      } else {
        setPendingResize(true);
      }
    };

    window.addEventListener('resize', _handleResize);
    return () => {
      window.removeEventListener('resize', _handleResize);
    };
  });

  return null;
};

ResizeListener.defaultProps = {
  throttleRate: defaultThrottleRate,
};

ResizeListener.propTypes = {
  handleResize: PropTypes.func.isRequired,
  throttleRate: PropTypes.number,
};

export default ResizeListener;
