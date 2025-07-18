import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

jest.mock('crypto');

describe('UrlsService', () => {
  let service: UrlsService;
  let urlRepository: Repository<Url>;

  const mockUrl = {
    id: 1,
    longUrl: 'https://example.com',
    slug: 'abc123',
    clickCount: 0,
    user: { id: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUrlRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlRepository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUrlDto = {
      longUrl: 'https://example.com',
      slug: 'custom-slug',
    };

    it('should create a URL with custom slug', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(mockUrl);
      mockUrlRepository.save.mockResolvedValue(mockUrl);

      const result = await service.create(createUrlDto, 1);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'custom-slug' },
      });
      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        longUrl: 'https://example.com',
        slug: 'custom-slug',
        user: { id: 1 },
      });
      expect(result).toEqual(mockUrl);
    });

    it('should create a URL with generated slug', async () => {
      const createUrlDtoWithoutSlug = {
        longUrl: 'https://example.com',
      };

      (randomBytes as jest.Mock).mockReturnValue({
        toString: jest.fn().mockReturnValue('generatedslug'),
      });

      mockUrlRepository.findOne
        .mockResolvedValueOnce(null) // for generated slug check
        .mockResolvedValueOnce(null); // for final slug check
      mockUrlRepository.create.mockReturnValue(mockUrl);
      mockUrlRepository.save.mockResolvedValue(mockUrl);

      const result = await service.create(createUrlDtoWithoutSlug, 1);

      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        longUrl: 'https://example.com',
        slug: 'generat', // slice(0, 7) from 'generatedslug'
        user: { id: 1 },
      });
      expect(result).toEqual(mockUrl);
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);

      await expect(service.create(createUrlDto, 1)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUrlDto, 1)).rejects.toThrow(
        'Slug already exists',
      );
    });

    it('should create URL without user', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(mockUrl);
      mockUrlRepository.save.mockResolvedValue(mockUrl);

      await service.create(createUrlDto);

      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        longUrl: 'https://example.com',
        slug: 'custom-slug',
        user: undefined,
      });
    });
  });

  describe('getLongUrl', () => {
    it('should return long URL and increment click count', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);
      mockUrlRepository.increment.mockResolvedValue(undefined);

      const result = await service.getLongUrl('abc123');

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'abc123' },
      });
      expect(mockUrlRepository.increment).toHaveBeenCalledWith(
        { id: 1 },
        'clickCount',
        1,
      );
      expect(result).toBe('https://example.com');
    });

    it('should throw NotFoundException if slug not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.getLongUrl('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getLongUrl('nonexistent')).rejects.toThrow(
        'Slug not found',
      );
    });
  });

  describe('findByUser', () => {
    it('should return URLs for a specific user', async () => {
      const urls = [mockUrl];
      mockUrlRepository.find.mockResolvedValue(urls);

      const result = await service.findByUser(1);

      expect(mockUrlRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
      });
      expect(result).toEqual(urls);
    });
  });

  describe('update', () => {
    const updateUrlDto = {
      longUrl: 'https://updated.com',
      slug: 'updated-slug',
    };

    it('should update URL successfully', async () => {
      mockUrlRepository.findOne
        .mockResolvedValueOnce(mockUrl)
        .mockResolvedValueOnce(null); // for slug check
      mockUrlRepository.save.mockResolvedValue({
        ...mockUrl,
        ...updateUrlDto,
      });

      const result = await service.update(1, updateUrlDto, 1);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result.longUrl).toBe(updateUrlDto.longUrl);
      expect(result.slug).toBe(updateUrlDto.slug);
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateUrlDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own URL', async () => {
      const urlWithDifferentUser = { ...mockUrl, user: { id: 2 } };
      mockUrlRepository.findOne.mockResolvedValue(urlWithDifferentUser);

      await expect(service.update(1, updateUrlDto, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException if new slug already exists', async () => {
      const urlToUpdate = { ...mockUrl, slug: 'old-slug' };
      mockUrlRepository.findOne
        .mockResolvedValueOnce(urlToUpdate) // for finding the URL to update
        .mockResolvedValueOnce({ ...mockUrl, id: 2 }); // different URL with same new slug

      await expect(service.update(1, updateUrlDto, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove URL successfully', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);
      mockUrlRepository.delete.mockResolvedValue(undefined);

      await service.remove(1, 1);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(mockUrlRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own URL', async () => {
      const urlWithDifferentUser = { ...mockUrl, user: { id: 2 } };
      mockUrlRepository.findOne.mockResolvedValue(urlWithDifferentUser);

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('stats', () => {
    it('should return click count stats', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);

      const result = await service.stats(1, 1);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result).toEqual({ clickCount: 0 });
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.stats(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own URL', async () => {
      const urlWithDifferentUser = { ...mockUrl, user: { id: 2 } };
      mockUrlRepository.findOne.mockResolvedValue(urlWithDifferentUser);

      await expect(service.stats(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
