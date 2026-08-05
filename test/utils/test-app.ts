import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../../src/app/app.module';
import configureApp from '../../src/app/config/app.configuration';
import { EmailService } from '../../src/email/email.service';
import { User } from '../../src/users/entities/user.entity';

export const emailMock = {
  sendEmail: jest.fn().mockResolvedValue(undefined),
};

export interface TestContext {
  app: INestApplication<App>;
  httpServer: App;
  dataSource: DataSource;
  userRepository: Repository<User>;
}

export async function createTestApp(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useValue(emailMock)
    .compile();

  const app = moduleFixture.createNestApplication<App>();
  configureApp(app);
  await app.init();

  const dataSource = moduleFixture.get(DataSource);
  const userRepository = dataSource.getRepository(User);

  return {
    app,
    httpServer: app.getHttpServer(),
    dataSource,
    userRepository,
  };
}

export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@test.com`;
}

export async function getVerificationCode(
  userRepository: Repository<User>,
  email: string,
): Promise<string | null> {
  const user = await userRepository.findOneBy({ email });
  return user?.verificationCode ?? null;
}

export function extractResetToken(emailPayload: { html?: string }): string | null {
  const match = emailPayload?.html?.match(/token=([^"'&\s]+)/);
  return match ? match[1] : null;
}
