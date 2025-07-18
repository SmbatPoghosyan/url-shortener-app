import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return user info from JWT payload', async () => {
      const payload = {
        sub: '1',
        email: 'test@example.com',
        iat: 1609459200,
        exp: 1609545600,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: '1',
        email: 'test@example.com',
      });
    });

    it('should handle different payload structures', async () => {
      const payload = {
        sub: '123',
        email: 'user@example.com',
        role: 'admin',
        iat: 1609459200,
        exp: 1609545600,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: '123',
        email: 'user@example.com',
      });
    });
  });
});
