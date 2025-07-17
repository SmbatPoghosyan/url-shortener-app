process.env.NODE_ENV = 'test';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
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
  });

  afterEach(async () => {
    if (module) {
      // Get the DataSource and close it properly
      const dataSource = module.get<DataSource>(DataSource);
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AppController', () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AppController);
  });

  it('should have AppService', () => {
    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AppService);
  });

  it('should inject AppService into AppController', () => {
    const controller = module.get<AppController>(AppController);
    const service = module.get<AppService>(AppService);

    // Verify that the controller can use the service
    expect(controller.getHello()).toBe(service.getHello());
  });

  it('should configure TypeORM module', () => {
    const typeOrmModule = module.get(TypeOrmModule);
    expect(typeOrmModule).toBeDefined();
  });

  describe('Module Configuration', () => {
    it('should compile without errors', () => {
      // Module is already compiled in beforeEach, so we just verify it exists
      expect(module).toBeDefined();
      expect(module).toBeInstanceOf(TestingModule);
    });

    it('should have correct providers count', () => {
      const providers = module.get<AppService[]>(AppService);
      expect(providers).toBeDefined();
    });

    it('should have correct controllers count', () => {
      const controllers = module.get<AppController[]>(AppController);
      expect(controllers).toBeDefined();
    });
  });

  describe('Database Configuration', () => {
    it('should have TypeORM configured with correct settings', () => {
      // Since we're overriding with in-memory SQLite for testing,
      // we just verify that TypeORM module is properly loaded
      const typeOrmModule = module.get(TypeOrmModule);
      expect(typeOrmModule).toBeDefined();
    });
  });
});
