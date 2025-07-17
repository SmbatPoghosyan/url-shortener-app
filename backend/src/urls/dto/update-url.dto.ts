import { IsOptional, IsUrl, Matches } from 'class-validator';

export class UpdateUrlDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  slug?: string;

  @IsOptional()
  @IsUrl()
  longUrl?: string;
}
