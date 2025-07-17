import { IsOptional, IsUrl, Matches } from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  longUrl: string;

  @IsOptional()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  slug?: string;
}
