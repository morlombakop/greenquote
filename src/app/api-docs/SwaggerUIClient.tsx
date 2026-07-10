'use client';

import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  spec: object;
};

export default function SwaggerUIClient({ spec }: Props) {
  return <SwaggerUI spec={spec} />;
}
