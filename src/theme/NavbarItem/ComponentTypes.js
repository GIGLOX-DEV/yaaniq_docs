import React from 'react';
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import ApiVersionSelector from '@site/src/components/ApiVersionSelector';

export default {
  ...ComponentTypes,
  'custom-apiVersionSelector': () => <ApiVersionSelector />,
};

