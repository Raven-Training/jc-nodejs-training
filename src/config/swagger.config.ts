import path from 'node:path';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

export const setupSwagger = () => {
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yml'));
    return [
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Kickoff Node.js API Documentation',
      }),
    ];
  } catch {
    console.warn('OpenAPI documentation not available');
    return [];
  }
};
