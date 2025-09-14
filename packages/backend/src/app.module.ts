import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './auth/auth.module';
import { ReportingModule } from './reporting/reporting.module';
import { CommunityModule } from './community/community.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ReportingModule,
    CommunityModule,
    AdminModule,
    MulterModule.register({
      dest: './uploads/temp',
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}