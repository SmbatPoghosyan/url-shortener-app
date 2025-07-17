import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  validateToken(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }
}
