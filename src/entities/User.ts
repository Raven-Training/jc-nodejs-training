import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UserRole } from '../types/user.types';

/**
 * User Entity - Represents users in the system with role-based access control
 *
 * Follows Clean Code principles:
 * - Clear and descriptive property names
 * - Proper TypeScript typing
 * - Single Responsibility: User data representation
 *
 * Database Design:
 * - Uses PostgreSQL ENUM for role field
 * - Default role: 'user' for security
 * - Proper indexing on unique fields
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false, select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
