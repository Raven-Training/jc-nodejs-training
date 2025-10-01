import config from '../config/config';
import { createAxiosInstance } from '../helpers/axios.helper';
import { createInternalError } from '../middlewares/error.middleware';

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export async function getAllTodos(): Promise<Todo[]> {
  try {
    const { data } = await createAxiosInstance(config.todosApi.baseURL).get<Todo[]>('todos');
    return data;
  } catch (error) {
    console.error(`Todos API - Error fetching data for 'todos':`, error);
    throw createInternalError('TODOS_API_ERROR', 500)(
      'Failed to fetch data from Todos API',
      error instanceof Error ? error : undefined,
    );
  }
}
