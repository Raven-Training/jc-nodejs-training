import { todosAxiosInstance, handleApiError } from '../helpers/axios.helper';

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export async function getAllTodos(): Promise<Todo[]> {
  try {
    const response = await todosAxiosInstance.get<Todo[]>('todos');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'todos');
  }
}
