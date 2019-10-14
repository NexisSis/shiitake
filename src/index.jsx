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
  const [testChildren, setTestChildren] = useState({ text: '' });
  const [fixHeigth, setFixHeight] = useState(0);
  const [handlingResize, setHandlingResize] = useState(false);
  const resizeListenerRef = useRef(null);
  const spreaderRef = useRef(null);
  const sizerRef = useRef(null);
  const testChildrenRef = useRef(null);
  const isFirstRun = useRef(true);

  const _callDeffered = (func) => {
    setTimeout(() => {
      if (spreaderRef) { func.bind(this)(); }
    }, 0);
  };

  const _setChildren = () => {
    const oldChildren = children;
    let newChildren = allChildren;

    // need trim?
    if (testChildren.text.length < newChildren.length) {
      newChildren = testChildren.text.split(' ').slice(0, -1).join(' ');
    }

    setHandlingResize(false);
    setLastCalculatedWidth(spreaderRef.current.offsetWidth);
    setChildren(newChildren);

    // if we  changed the length of the visible string, check if we're switching from truncated to
    // not-truncated or vica versa
    const wasTruncatedBefore = oldChildren.length !== allChildren.length;
    const isTruncatedNow = newChildren.length !== allChildren.length;

    if (
      typeof props.onTruncationChange === 'function'
      && newChildren.length !== oldChildren.length
      && wasTruncatedBefore !== isTruncatedNow
    ) {
      props.onTruncationChange(isTruncatedNow);
    }
  };

  const _setTestChildren = (start, end) => {
    const trimEnd = (end - start < 6 || lastCalculatedWidth > -1) ? end : end - Math.round((end - start) / 2);
    setTestChildren({ text: allChildren.substring(0, trimEnd), start, end });
  };

  const _checkHeight = (start, end) => {
    const contentHeight = testChildrenRef.current.offsetHeight;
    const targetHeight = sizerRef.current.offsetHeight;

    const halfWay = end - Math.round((end - start) / 2);
    // TODO: refine this flag, make simpler
    const linear = (end - start < 6
      || (end === testChildren.text.length && end !== allChildren.length)
      || lastCalculatedWidth > -1);

    if (contentHeight > targetHeight && linear) {
      _setTestChildren(testChildren.text.length, testChildren.text.length - 1);
      return;
    }
    if (contentHeight > targetHeight && !linear) {
      _setTestChildren(start, halfWay);
      return;
    }
    if (testChildren.text.length === allChildren.length) {
      _setChildren();
      return;
    }
    if (linear && start > end) {
      _setChildren();
      return;
    }

    if (linear) {
      _setTestChildren(testChildren.text.length, testChildren.text.length + 1);
      return;
    }

    _setTestChildren(halfWay, end);
  };

  const handleResize = () => {
    // if we don't have a spreader, let it come around again
    if (!spreaderRef) { return; }
    const availableWidth = spreaderRef.current.offsetWidth;

    setChildren(children || allChildren);
    setFixHeight(sizerRef.current.offsetHeight);

    // was there a width change, or lines change?
    if (availableWidth !== lastCalculatedWidth && !handlingResize) {
      setHandlingResize(true);
      // first render?
      if (testChildren.text === '') {
        setTestChildren({ text: allChildren, start: 0, end: allChildren.length });
        return;
      }
      // window got smaller?
      if (availableWidth < lastCalculatedWidth) {
        setTestChildren({ text: testChildren.text, start: testChildren.length, end: testChildren.length - 1 });
        return;
      }
      setTestChildren({ text: testChildren.text, start: testChildren.length, end: testChildren.length + 1 });
    }
  };

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
    }

    handleResize();
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      return;
    }
    _callDeffered(_checkHeight.bind(this, testChildren.start, testChildren.end));
  }, [testChildren]);

  useEffect(() => {
    if (isFirstRun.current) {
      return;
    }

    _callDeffered(() => {
      setTestChildren({ text: '', start: 0, end: 0 });
      setLastCalculatedWidth(-1);
      setChildren(allChildren);
    });
  }, [props.lines]);


  useEffect(() => {
    // if we've got different children, reset and retest
    if (props.children !== allChildren) {
      setAllChildres((typeof props.children === 'string') ? props.children : '');
      setLastCalculatedWidth(-1);
      setChildren(props.children);
      _setTestChildren(0, props.children.length);
    }
  }, [props.children, allChildren]);

  const { renderFullOnServer, className, overflowNode } = props;
  const tagNames = { main: setTag(props.tagName) };
  const thisHeight = `${fixHeigth}px`;
  const maxHeight = (renderFullOnServer) ? '' : thisHeight;
  const overflow = (testChildren.text.length < allChildren.length) ? overflowNode : null;
  const vertSpacers = [];
  for (let i = 0; i < props.lines; i++) {
    vertSpacers.push(<span style={block} key={i}>W</span>);
  }

  return (
    <tagNames.main ref={resizeListenerRef} className={className || ''} {...passProps(props)}>
      <ResizeListener handleResize={handleResize} resizeListenerRef={resizeListenerRef} isFirstRun={isFirstRun} />
      <span style={{ ...wrapperStyles, maxHeight }}>
        <span style={childrenStyles}>{children}{overflow}</span>
        <span ref={spreaderRef} style={spreaderStyles} aria-hidden="true">{allChildren}</span>
        <span style={sizerWrapperStyles} aria-hidden="true">
          <span ref={sizerRef} style={block}>{vertSpacers}</span>
          <span ref={testChildrenRef} style={block}>{testChildren.text}{overflow}</span>
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
