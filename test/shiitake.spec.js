/* eslint-env node, mocha */
/* eslint-disable react/jsx-filename-extension*/

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, mount, configure } from 'enzyme';
import Shiitake from '../src/index';

configure({ adapter: new Adapter() });

const expect = require('expect');

const ipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pretium tincidunt viverra. Pellentesque
  auctor leo sit amet eros fringilla placerat. Proin et velit nec nulla laoreet sagittis. Nullam finibus lorem
  cursus, convallis diam nec, laoreet libero. In venenatis, risus sit amet lobortis commodo, dui nulla feugiat
  libero, sed pharetra enim mauris id turpis.`;

const ipsumSmall = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pretium tincidunt viverra. Pellentesque
  auctor leo sit amet eros fringilla placerat. Proin et velit nec nulla laoreet sagittis.`;

const overflowElepsis = '\u2026';

describe('Shiitake', () => {
  it('should render the children', () => {
    const el = mount(<Shiitake lines={1}>Hello world</Shiitake>);
    expect(el.text()).toContain('Hello world');
  });

  it('should trim with elipsis when text does not fit in line', () => {
    const el = mount(<Shiitake lines={1}>{ipsum}</Shiitake>);
    setTimeout(() => {
      expect(el.text()).toContain(overflowElepsis);
    }, 50);
  });

  it('should pass mouse events through', () => {
    const testClick = expect.createSpy();
    const el = mount(<Shiitake lines={1} onClick={testClick}>Hello world</Shiitake>);

    el.simulate('click');
    expect(testClick).toHaveBeenCalled();
  });

  it('should use the tagname you want', () => {
    const el = shallow(<Shiitake lines={1} tagName="p">Hello world</Shiitake>);
    expect(el.find('p').length).toEqual(1);
  });


  it('should handle non string children', () => {
    shallow(<Shiitake lines={1}>{null}</Shiitake>);
    shallow(<Shiitake lines={1}>{undefined}</Shiitake>);
    shallow(<Shiitake lines={1}>{false}</Shiitake>);
    shallow(<Shiitake lines={1}><div>foo bar</div></Shiitake>);
  });

  it('should use a custom overflowNode if provided', () => {
    const el = shallow(
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
    );
    expect(el.find('a').length).toBeGreaterThan(1);
  });
});
