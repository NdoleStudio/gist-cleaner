import React from 'react';
import ReactDOM from 'react-dom';
import CheckBox from "./CheckBox";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CheckBox/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
