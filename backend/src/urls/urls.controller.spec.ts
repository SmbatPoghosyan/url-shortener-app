import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';

describe('UrlsController', () => {
  let controller: UrlsController;
  let urlsService: UrlsService;

  const mockUrl = {
    id: 1,
    longUrl: 'https://example.com',
    slug: 'abc123',
    clickCount: 0,
    user: { id: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUrlsService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    stats: jest.fn(),
    getLongUrl: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: mockUrlsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UrlsController>(UrlsController);
    urlsService = module.get<UrlsService>(UrlsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new URL', async () => {
      const createUrlDto = {
        longUrl: 'https://example.com',
        slug: 'custom-slug',
      };

      mockUrlsService.create.mockResolvedValue(mockUrl);

      const result = await controller.create(createUrlDto, mockRequest);

      expect(urlsService.create).toHaveBeenCalledWith(createUrlDto, 1);
      expect(result).toEqual(mockUrl);
    });
  });

  describe('list', () => {
    it('should return URLs for authenticated user', async () => {
      const urls = [mockUrl];
      mockUrlsService.findByUser.mockResolvedValue(urls);

      const result = await controller.list(mockRequest);

      expect(urlsService.findByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(urls);
    });
  });

  describe('update', () => {
    it('should update URL', async () => {
      const updateUrlDto = {
        longUrl: 'https://updated.com',
        slug: 'updated-slug',
      };
      const updatedUrl = { ...mockUrl, ...updateUrlDto };

      mockUrlsService.update.mockResolvedValue(updatedUrl);

      const result = await controller.update(1, updateUrlDto, mockRequest);

      expect(urlsService.update).toHaveBeenCalledWith(1, updateUrlDto, 1);
      expect(result).toEqual(updatedUrl);
    });
  });

  describe('remove', () => {
    it('should remove URL', async () => {
      mockUrlsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, mockRequest);

      expect(urlsService.remove).toHaveBeenCalledWith(1, 1);
      expect(result).toBeUndefined();
    });
  });

  describe('stats', () => {
    it('should return URL stats', async () => {
      const statsResult = { clickCount: 5 };
      mockUrlsService.stats.mockResolvedValue(statsResult);

      const result = await controller.stats(1, mockRequest);

      expect(urlsService.stats).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(statsResult);
    });
  });

  describe('redirect', () => {
    it('should redirect to long URL', async () => {
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      mockUrlsService.getLongUrl.mockResolvedValue('https://example.com');

      await controller.redirect('abc123', mockResponse);

      expect(urlsService.getLongUrl).toHaveBeenCalledWith('abc123');
      expect(mockResponse.redirect).toHaveBeenCalledWith('https://example.com');
    });
  });
});
