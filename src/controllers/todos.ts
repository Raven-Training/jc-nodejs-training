import { Response, NextFunction, Request } from 'express';
import status from 'http-status';

import { getAllTodos, Todo } from '../services/todos';

export function getTodos(_: Request, res: Response, next: NextFunction): Promise<Response | void> {
  return getAllTodos()
    .then((todos: Todo[]) => res.status(status.OK).json(todos))
    .catch(next);
}
