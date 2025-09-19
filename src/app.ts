import path from 'node:path';

import cors from 'cors';
import express from 'express';

import { errorHandlerMiddleware } from './middlewares/error.middleware';
import * as routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/docs', express.static(path.join(__dirname, 'docs')));
routes.init(app);

app.use(errorHandlerMiddleware);

export default app;
