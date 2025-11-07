import { PokemonPurchase } from '../entities/PokemonPurchase';
import { PokemonPurchaseResponse } from '../types/cards.types';

export const mapPokemonPurchaseToResponse = (
  purchase: PokemonPurchase,
): PokemonPurchaseResponse => ({
  id: purchase.id,
  pokemonId: purchase.pokemonId,
  pokemonName: purchase.pokemonName,
  pokemonImage: purchase.pokemonImage,
  pokemonTypes: purchase.pokemonTypes,
  price: purchase.price,
  purchasedAt: purchase.purchasedAt,
});
