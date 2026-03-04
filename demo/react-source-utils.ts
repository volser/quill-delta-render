import React from 'react';
import reactElementToJSXString from 'react-element-to-jsx-string';

export const serializeReactNode = (node: React.ReactNode): string => {
  const element = React.isValidElement(node) ? node : React.createElement(React.Fragment, null, node);
  return reactElementToJSXString(element, { showDefaultProps: false });
};
