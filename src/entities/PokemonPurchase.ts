import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pokemon_purchase')
export class PokemonPurchase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'pokemon_id', nullable: false })
  pokemonId!: number;

  @Column({ name: 'pokemon_name', nullable: false })
  pokemonName!: string;

  @Column({ name: 'pokemon_image', nullable: true })
  pokemonImage!: string;

  @Column({
    name: 'pokemon_types',
    type: 'simple-array',
    nullable: false,
    comment: 'Array of Pokemon types (e.g., fire, water, grass)',
  })
  pokemonTypes!: string[];

  @Column({ name: 'user_id', nullable: false })
  userId!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price!: number;

  @CreateDateColumn({ name: 'purchased_at' })
  purchasedAt!: Date;
}
