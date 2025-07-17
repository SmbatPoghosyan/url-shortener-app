import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { randomBytes } from 'crypto';

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
    return url.longUrl;
  }
}
