import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AppService } from '../app.service';

@Module({
  controllers: [ApiController],
  providers: [AppService],
})
export class ApiModule {}