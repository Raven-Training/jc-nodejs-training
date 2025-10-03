import config from '../config/config';
import { createAxiosInstance } from '../helpers/axios.helper';
import { createInternalError } from '../middlewares/error.middleware';
import { Pokemon } from '../types/cards.types';

export const getPokemons = async (): Promise<Pokemon[]> => {
  try {
    const { data } = await createAxiosInstance(config.pokeApi.baseURL).get<Pokemon[]>('pokemon');
    console.info(`PokeAPI - Data for 'pokemon' obtained successfully.`);
    return data;
  } catch (error) {
    console.error(`PokeAPI - Error fetching data for 'pokemon':`, error);
    throw createInternalError('POKEAPI_ERROR', 500)(
      'Failed to fetch data from PokeAPI',
      error instanceof Error ? error : undefined,
    );
  }
};
