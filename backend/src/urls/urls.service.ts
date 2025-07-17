import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { randomBytes } from 'crypto';
import { UpdateUrlDto } from './dto/update-url.dto';

@Injectable()
export class UrlsService {
  constructor(@InjectRepository(Url) private urls: Repository<Url>) {}

  private async generateSlug(length = 7): Promise<string> {
    while (true) {
      const slug = randomBytes(length).toString('base64url').slice(0, length);
      const existing = await this.urls.findOne({ where: { slug } });
      if (!existing) {
        return slug;
      }
    }
  }

  async create(dto: CreateUrlDto, userId?: number): Promise<Url> {
    const slug = dto.slug ?? (await this.generateSlug());
    const existing = await this.urls.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }
    const url = this.urls.create({
      longUrl: dto.longUrl,
      slug,
      user: userId ? ({ id: userId } as any) : undefined,
    });
    return this.urls.save(url);
  }

  async getLongUrl(slug: string): Promise<string> {
    const url = await this.urls.findOne({ where: { slug } });
    if (!url) {
      throw new NotFoundException('Slug not found');
    }
    await this.urls.increment({ id: url.id }, 'clickCount', 1);
    return url.longUrl;
  }

  async findByUser(userId: number): Promise<Url[]> {
    return this.urls.find({ where: { user: { id: userId } } });
  }

  async update(id: number, dto: UpdateUrlDto, userId: number): Promise<Url> {
    const url = await this.urls.findOne({ where: { id }, relations: ['user'] });
    if (!url) {
      throw new NotFoundException('Url not found');
    }
    if (url.user?.id !== userId) {
      throw new ForbiddenException();
    }
    if (dto.slug && dto.slug !== url.slug) {
      const existing = await this.urls.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException('Slug already exists');
      }
      url.slug = dto.slug;
    }
    if (dto.longUrl) {
      url.longUrl = dto.longUrl;
    }
    return this.urls.save(url);
  }

  async remove(id: number, userId: number): Promise<void> {
    const url = await this.urls.findOne({ where: { id }, relations: ['user'] });
    if (!url) {
      throw new NotFoundException('Url not found');
    }
    if (url.user?.id !== userId) {
      throw new ForbiddenException();
    }
    await this.urls.delete(id);
  }

  async stats(id: number, userId: number): Promise<{ clickCount: number }> {
    const url = await this.urls.findOne({ where: { id }, relations: ['user'] });
    if (!url) {
      throw new NotFoundException('Url not found');
    }
    if (url.user?.id !== userId) {
      throw new ForbiddenException();
    }
    return { clickCount: url.clickCount };
  }
}
