import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { parse } from 'pg-connection-string';

const dbUrl = process.env.DATABASE_URL || '';

const config = parse(dbUrl);

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.host ?? undefined,
  port: parseInt(config.port || '5432'),
  username: config.user,
  password: config.password,
  database: config.database ?? undefined,

  autoLoadEntities: true,
  synchronize: true, // ⚠️ en producción siempre false
  ssl: {
    rejectUnauthorized: false, // necesario para Railway
  },
};
