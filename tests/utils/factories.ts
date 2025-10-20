import { User } from '../../src/entities/User';

// Datos de prueba
const names = [
  'Juan',
  'Maria',
  'Carlos',
  'Ana',
  'Luis',
  'Sofia',
  'Pedro',
  'Carmen',
  'Jose',
  'Elena',
];
const lastNames = [
  'Garcia',
  'Rodriguez',
  'Martinez',
  'Lopez',
  'Gonzalez',
  'Perez',
  'Sanchez',
  'Ramirez',
];
const domains = ['example.com', 'test.com', 'mail.com', 'email.com'];

// Utilidades simples
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const randomString = (length: number) =>
  Math.random()
    .toString(36)
    .substring(2, 2 + length);

// Generador de persona
const generatePerson = () => {
  const name = randomChoice(names);
  const lastName = randomChoice(lastNames);
  const email = `${name.toLowerCase()}.${lastName.toLowerCase()}${randomInt(100, 999)}@${randomChoice(domains)}`;
  return { name, lastName, email };
};

export const generateUser = (overrides: Partial<User> = {}): User => {
  const person = generatePerson();
  return {
    id: randomInt(1, 1000),
    ...person,
    password: randomString(10),
    createdAt: new Date(),
    ...overrides,
  };
};

export const generateUserInput = (overrides = {}) => {
  const person = generatePerson();
  return {
    ...person,
    password: randomString(12),
    ...overrides,
  };
};

export const generateInvalidPassword = () => randomString(5);
