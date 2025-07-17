process.env.NODE_ENV = "test";
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Urls (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let token: string;

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

    const email = 'url@example.com';
    const password = 'password';

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email, password });

    const res = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email, password });

    token = res.body.accessToken;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  it('shortens and redirects', async () => {
    const longUrl = 'https://example.com';
    const createRes = await request(app.getHttpServer())
      .post('/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ longUrl })
      .expect(201);

    const slug = createRes.body.slug;
    expect(slug).toBeDefined();

    await request(app.getHttpServer())
      .get(`/${slug}`)
      .expect(302)
      .expect('Location', longUrl);
  });

  it('lists, updates and deletes', async () => {
    const longUrl = 'https://example.org';
    const createRes = await request(app.getHttpServer())
      .post('/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ longUrl })
      .expect(201);

    const id = createRes.body.id;
    const slug = createRes.body.slug;

    const listRes = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].slug).toBe(slug);

    const newSlug = 'updated';
    await request(app.getHttpServer())
      .patch(`/urls/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: newSlug })
      .expect(200);

    const listRes2 = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listRes2.body[0].slug).toBe(newSlug);

    await request(app.getHttpServer())
      .delete(`/urls/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const listRes3 = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listRes3.body.length).toBe(0);
  });
});
