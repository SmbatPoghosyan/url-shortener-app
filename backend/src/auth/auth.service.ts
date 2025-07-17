import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<Omit<User, 'password'>> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({ email: dto.email, password: hash });
    const saved = await this.users.save(user);
    const { password, ...rest } = saved;
    return rest as Omit<User, 'password'>;
  }

  async signIn(
    dto: SignInDto,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const { password, ...rest } = user;
    return { accessToken, user: rest as Omit<User, 'password'> };
  }
}
