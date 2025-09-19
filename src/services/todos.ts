import axios from 'axios';

import config from '../config/config';

const client = axios.create({
  baseURL: config.todosApi.baseURL,
  responseType: 'json',
});

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export async function getAllTodos(): Promise<Todo[]> {
  const response = await client.get<Todo[]>('todos');
  return response.data;
}
