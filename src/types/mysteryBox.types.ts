export enum RarityLevel {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface IPokemonRarity {
  readonly level: RarityLevel;
  readonly probability: number;
  readonly weightRange: {
    readonly min: number;
    readonly max: number;
  };
}

export interface IMysteryBoxPurchaseResponse {
  readonly message: string;
  readonly data: {
    readonly id: number;
    readonly pokemonId: number;
    readonly pokemonName: string;
    readonly pokemonImage: string;
    readonly pokemonTypes: readonly string[];
    readonly rarity: RarityLevel;
    readonly price: number;
    readonly purchasedAt: Date;
  };
}

export const MYSTERY_BOX_PRICE = 100;

export const RARITY_PROBABILITIES: Record<RarityLevel, number> = {
  [RarityLevel.COMMON]: 0.5,
  [RarityLevel.UNCOMMON]: 0.25,
  [RarityLevel.RARE]: 0.15,
  [RarityLevel.EPIC]: 0.08,
  [RarityLevel.LEGENDARY]: 0.02,
};

export const WEIGHT_TO_RARITY_MAP: readonly IPokemonRarity[] = [
  {
    level: RarityLevel.COMMON,
    probability: RARITY_PROBABILITIES[RarityLevel.COMMON],
    weightRange: { min: 0, max: 100 },
  },
  {
    level: RarityLevel.UNCOMMON,
    probability: RARITY_PROBABILITIES[RarityLevel.UNCOMMON],
    weightRange: { min: 101, max: 300 },
  },
  {
    level: RarityLevel.RARE,
    probability: RARITY_PROBABILITIES[RarityLevel.RARE],
    weightRange: { min: 301, max: 600 },
  },
  {
    level: RarityLevel.EPIC,
    probability: RARITY_PROBABILITIES[RarityLevel.EPIC],
    weightRange: { min: 601, max: 1000 },
  },
  {
    level: RarityLevel.LEGENDARY,
    probability: RARITY_PROBABILITIES[RarityLevel.LEGENDARY],
    weightRange: { min: 1001, max: 10000 },
  },
];

export const HTTP_MYSTERY_BOX_SUCCESS = 201;
