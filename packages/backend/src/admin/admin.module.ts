
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { CatalogMappingService } from './catalog-mapping.service';
import { UsersModule } from 'src/users/users.module'; // Import to reuse UsersService
import { AuthModule } from 'src/auth/auth.module'; // Import for AuthService

@Module({
  imports: [UsersModule, AuthModule], // Reuse existing services
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, CatalogMappingService],
  exports: [AdminService, CatalogMappingService], // Export for other modules if needed
})
export class AdminModule {}