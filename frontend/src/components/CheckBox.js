import React from 'react';

export const CheckBox = () =>
  <div className="pretty p-icon p-bigger  p-pulse">
    <input type="checkbox"/>
    <div className="state p-success">
      <i className="icon mdi mdi-check"></i>
      <label></label>
    </div>
  </div>;


export default CheckBox;