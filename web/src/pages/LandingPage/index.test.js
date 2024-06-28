import React from 'react';
import ReactDOM from 'react-dom';
import LandingPage from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LandingPage/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
