import { Controller, Get } from '@nestjs/common';
import { CommunityService } from './community.service';

@Controller('tendencias-comunidad')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  getTendenciasComunidad() {
    return { message: 'Tendencias de comunidad endpoint - Coming soon' };
  }

  // TODO: Implement additional community endpoints in future stories
}