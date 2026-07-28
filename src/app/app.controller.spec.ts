import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);

    afterAll(async () => {
      await app.close();
    });
  });

  describe('root', () => {
    it('should return NODE_ENV or "ERROR"', () => {
      expect(appController.getHello()).toBe('test');
    });
  });
});
