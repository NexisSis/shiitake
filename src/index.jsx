/**
 * @class Shiitake
 * @description React line clamp that won't get you fired
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import ResizeListener from './ResizeListener';

import {
  wrapperStyles,
  childrenStyles,
  block,
  spreaderStyles,
  sizerWrapperStyles,
  setTag,
  passProps,
} from './constants';

const Shiitake = (props) => {
  const [allChildren, setAllChildres] = useState((typeof props.children === 'string') ? props.children : '');
  const [children, setChildren] = useState((props.renderFullOnServer) ? allChildren : '');
  const [lastCalculatedWidth, setLastCalculatedWidth] = useState(-1);
  const [testChildren, setTestChildren] = useState('');
  const [fixHeigth, setFixHeight] = useState(0);
  const [handlingResize, setHandlingResize] = useState(false);
  const [targetHeight, setTargetHeight] = useState(false);
  const resizeListenerRef = useRef(null);
  const spreaderRef = useRef(null);
  const sizerRef = useRef(null);
  const testChildrenRef = useRef(null);

  const _callDeffered = (func) => {
    setTimeout(() => {
      if (spreaderRef) { func(); }
    }, 0);
  };

  const _setChildren = () => {
    const oldChildren = children;
    let newChildren = allChildren;

    // need trim?
    if (testChildren.length < newChildren.length) {
      newChildren = testChildren.split(' ').slice(0, -1).join(' ');
    }

    setHandlingResize(false);
    setLastCalculatedWidth(spreaderRef.current.offsetWidth);
    setChildren(newChildren);

    // if we  changed the length of the visible string, check if we're switching from truncated to
    // not-truncated or vica versa
    if (newChildren.length !== oldChildren.length) {
      const wasTruncatedBefore = oldChildren.length !== allChildren.length;
      const isTruncatedNow = newChildren.length !== allChildren.length;
      console.log(props.onTruncationChange(isTruncatedNow));
      if (wasTruncatedBefore !== isTruncatedNow && typeof props.onTruncationChange === 'function') {
        props.onTruncationChange(isTruncatedNow);
      }
    }
  };

  // this will render test children trimmed at halfway point then come around to test height again
  const _setTestChildren = (start, end) => {
    // if it's within the treshold or has already been calculated, go linear
    const trimEnd = (end - start < 6 || lastCalculatedWidth > -1) ? end : end - Math.round((end - start) / 2);
    setTestChildren(allChildren.substring(0, trimEnd));
    _callDeffered(() => {
      _checkHeight(start, end);  // eslint-disable-line no-use-before-define
    });
  };

  const _checkHeight = (start, end) => {
    const contentHeight = testChildrenRef.current.offsetHeight;
    const halfWay = end - Math.round((end - start) / 2);

    // TODO: refine this flag, make simpler
    const linear = (end - start < 6
      || (end === testChildren.length && end !== allChildren.length)
      || lastCalculatedWidth > -1);

    // do we need to trim?
    if (contentHeight > targetHeight) {
      // chunk/ trim down
      if (linear) {
        _setTestChildren(testChildren.length, testChildren.length - 1);
      } else {
        _setTestChildren(start, halfWay);
      }
      // we've used all the characters in a window expand situation
    } else if (testChildren.length === allChildren.length) {
      _setChildren();
    } else if (linear) {
      // if we just got here by decrementing one, we're good
      if (start > end) {
        _setChildren();
      } else {
        // window grew, increment up one
        _setTestChildren(testChildren.length, testChildren.length + 1);
      }
    } else {
      // chunk up, still in binary search mode
      _setTestChildren(halfWay, end);
    }
  };

  // adds the trimmed content to state and fills the sizer on resize events
  const handleResize = () => {
    // if we don't have a spreader, let it come around again
    if (!spreaderRef) { return; }

    const availableWidth = spreaderRef.current.offsetWidth;
    setTargetHeight(sizerRef.current.offsetHeight);

    // set the max height right away, so that the resize throttle doesn't allow line break jumps
    // also populate with the full string if we don't have a working trimmed string yet
    setChildren(children || allChildren);
    setFixHeight(targetHeight);


    // was there a width change, or lines change?
    if (availableWidth !== lastCalculatedWidth && !handlingResize) {
      setHandlingResize(true);

      // first render?
      if (testChildren === '') {
        // give it the full string and check the height
        setTestChildren(allChildren);
        _callDeffered(() => _checkHeight(0, allChildren.length));

        // window got smaller?
      } else if (availableWidth < lastCalculatedWidth) {
        // increment down one
        _callDeffered(() => _checkHeight(testChildren.length, testChildren.length - 1));

        // window got larger?
      } else {
        // increment up one
        _callDeffered(() => _checkHeight(testChildren.length, testChildren.length + 1));
      }
    }
  };

  useEffect(() => {
    handleResize();
  });

  useEffect(() => {
    // if we've got different children, reset and retest
    if (props.children !== allChildren) {
      setAllChildres((typeof props.children === 'string') ? props.children : '');
      setLastCalculatedWidth(-1);
      setChildren(props.children);
      _setTestChildren(0, props.children.length);
    }
  }, [props.children, allChildren]);

  useEffect(() => {
    _callDeffered(() => {
      setTestChildren('');
      setLastCalculatedWidth(-1);
      setChildren(allChildren);
      handleResize();
    });
  }, [props.lines]);

  const { renderFullOnServer, className, overflowNode } = props;
  const tagNames = { main: setTag(props.tagName) };
  const thisHeight = `${fixHeigth}px`;
  const maxHeight = (renderFullOnServer) ? '' : thisHeight;
  const overflow = (testChildren.length < allChildren.length) ? overflowNode : null;
  const vertSpacers = [];
  for (let i = 0; i < props.lines; i++) {
    vertSpacers.push(<span style={block} key={i}>W</span>);
  }

  return (
    <tagNames.main ref={resizeListenerRef} className={className || ''} {...passProps(props)}>
      <ResizeListener handleResize={handleResize} resizeListenerRef={resizeListenerRef} />
      <span style={{ ...wrapperStyles, maxHeight }}>
        <span style={childrenStyles}>{children}{overflow}</span>
        <span ref={spreaderRef} style={spreaderStyles} aria-hidden="true">{allChildren}</span>
        <span style={sizerWrapperStyles} aria-hidden="true">
          <span ref={sizerRef} style={block}>{vertSpacers}</span>
          <span ref={testChildrenRef} style={block}>{testChildren}{overflow}</span>
        </span>
      </span>
    </tagNames.main>
  );
};

Shiitake.defaultProps = {
  className: '',
  renderFullOnServer: false,
  tagName: undefined,
  overflowNode: '\u2026',
  // in case someone accidentally passes something undefined in as children
  children: '',
  onTruncationChange: undefined,
};

Shiitake.propTypes = {
  lines: PropTypes.number.isRequired,
  className: PropTypes.string,
  children: PropTypes.string.isRequired,
  renderFullOnServer: PropTypes.bool,
  tagName: PropTypes.string,
  overflowNode: PropTypes.node,
  onTruncationChange: PropTypes.func,
};

export default Shiitake;
