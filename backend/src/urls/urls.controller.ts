import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('urls')
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateUrlDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.urlsService.create(dto, userId);
  }

  @Get(':slug')
  async redirect(@Param('slug') slug: string, @Res() res: Response) {
    const longUrl = await this.urlsService.getLongUrl(slug);
    return res.redirect(longUrl);
  }
}
