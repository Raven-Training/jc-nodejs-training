import { cardsAxiosInstance, handleApiError } from '../helpers/axios.helper';
import { Pokemon } from '../types/cards.types';

export const getPokemons = async (): Promise<Pokemon[]> => {
  try {
    const response = await cardsAxiosInstance.get<Pokemon[]>('pokemon');
    console.info(`PokeAPI - Data for 'pokemon' obtained successfully.`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'pokemon');
  }
};
