/* eslint-disable strict, react/jsx-filename-extension */

'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server'); // eslint-disable-line
const Shiitake = require('../src').default;

const App = () => (
  <div>
    <Shiitake lines={2} tagName="p">Hello</Shiitake>
  </div>
);

const string = ReactDOMServer.renderToString(<App />);

console.log(string);
