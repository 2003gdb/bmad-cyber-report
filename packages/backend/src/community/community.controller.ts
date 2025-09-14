import { Controller } from '@nestjs/common';
import { CommunityService } from './community.service';

@Controller('tendencias-comunidad')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // TODO: Implement community endpoints in future stories
}