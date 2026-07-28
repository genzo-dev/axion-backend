import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  database: {
    type: process.env.POSTGRES_TYPE as 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER || 'user',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'app_db_dev',
    autoLoadEntities: Boolean(process.env.POSTGRES_AUTO_LOAD_ENTITIES),
    synchronize: Boolean(process.env.POSTGRES_SYNCHRONIZE),
  },
  environment: process.env.NODE_ENV || 'development',
}));
