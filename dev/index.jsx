/* eslint-env browser */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Shiitake from '../src';

import './index.css';

const ipsum1 = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pretium tincidunt viverra. Pellentesque
auctor leo sit amet eros fringilla placerat. Proin et velit nec nulla laoreet sagittis. Nullam finibus lorem
cursus, convallis diam nec, laoreet libero. In venenatis, risus sit amet lobortis commodo, dui nulla feugiat
libero, sed pharetra enim mauris id turpis.`;

const ipsum2 = `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
printer took a galley of type and scrambled it to make a type specimen book. It has survived not only
five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently
with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

const App = () => {
  const [ipsum, setIpsum] = useState(ipsum1);
  const [dynamicLines, setDynamicLines] = useState(2);
  const [truncatedText, setTruncatedText] = useState(false);
  const text = 'Cook it up all night with Shitakes';

  // used to verify that passing undefined is safe
  let nullText;

  return (
    <div className="wrapper">
      <h1>Shiitake Demo</h1>
      <p>Here are some examples of Shiitake in the wild.</p>

      <h2>Compare with webkit line-clamp</h2>
      <div className="side-by-side">
        <Shiitake lines={2} className="shiitake">
          {text}
        </Shiitake>
        <div className="line-clamp">
          {text}
        </div>
      </div>

      <h2>Create inline style with flexbox:</h2>
      <div className="shiitake-inline-wrapper">
        <Shiitake lines={1} className="shiitake-inline">
          {text}
        </Shiitake>
        &gt;
      </div>

      <h2>Specify your own tag name:</h2>
      <Shiitake tagName="p" lines={1} className="shiitake-paragraph" onClick={() => setIpsum(ipsum2)}>
        {ipsum}
      </Shiitake>

      <h2>Can handle undefined children</h2>
      <Shiitake lines={1}>
        {nullText}
      </Shiitake>

      <h2>Example of showing/hiding</h2>
      <div className="show-hide-example">
        <h4>Hover here</h4>
        <div className="show-hide-content">
          <Shiitake lines={2}>
            {ipsum}
          </Shiitake>
        </div>
      </div>

      <h2>Change lines dynamically</h2>
      <div>
        <Shiitake lines={dynamicLines}>{ipsum}</Shiitake>
        <button
          onClick={() => setDynamicLines((dynamicLines === 2) ? 1 : 2)}
        >
          Change to {(dynamicLines === 2) ? '1 line' : '2 lines'}
        </button>
      </div>

      <h2>Custom overflow node</h2>
      <div>
        <Shiitake
          lines={2}
          overflowNode={
            <a href="https://github.com/bsidelinger912/shiitake#readme" target="_blank" rel="noopener noreferrer">
              ...read more
            </a>
          }
        >
          {ipsum}
        </Shiitake>
      </div>

      <h2>Detect if text is truncated</h2>
      <div>
        <Shiitake
          lines={2}
          onTruncationChange={isTruncated => setTruncatedText(isTruncated)}
        >
          {ipsum}
        </Shiitake>
        <p className="example-label">
          {truncatedText ? 'this text is truncated ^^' : 'this text is not truncated ^^'}
        </p>
      </div>
      <p className="read-more">
        read more <a href="https://github.com/bsidelinger912/shiitake#readme">here</a>.
      </p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('react-root'));
