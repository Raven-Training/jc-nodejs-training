jest.mock('../src/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        tokenVersion: 0,
      }),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }),
    initialize: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
  },
}));
