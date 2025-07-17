import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Req,
  Res,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Response } from 'express';
import { UpdateUrlDto } from './dto/update-url.dto';
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

  @Get('urls')
  @UseGuards(JwtAuthGuard)
  list(@Req() req: any) {
    return this.urlsService.findByUser(req.user.userId);
  }

  @Patch('urls/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: number,
    @Body() dto: UpdateUrlDto,
    @Req() req: any,
  ) {
    return this.urlsService.update(id, dto, req.user.userId);
  }

  @Delete('urls/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: number, @Req() req: any) {
    return this.urlsService.remove(id, req.user.userId);
  }

  @Get(':slug')
  async redirect(@Param('slug') slug: string, @Res() res: Response) {
    const longUrl = await this.urlsService.getLongUrl(slug);
    return res.redirect(longUrl);
  }
}
