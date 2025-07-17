process.env.NODE_ENV = 'test';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Throttling (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(TypeOrmModule)
      .useModule(
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          autoLoadEntities: true,
        }),
      )
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // sign up once for login tests
    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email: 'limit@example.com', password: 'password' });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  it('rate limits sign-in requests', async () => {
    const server = app.getHttpServer();

    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/auth/sign-in')
        .send({ email: 'limit@example.com', password: 'password' })
        .expect(201);
    }

    await request(server)
      .post('/auth/sign-in')
      .send({ email: 'limit@example.com', password: 'password' })
      .expect(429);
  });
});
