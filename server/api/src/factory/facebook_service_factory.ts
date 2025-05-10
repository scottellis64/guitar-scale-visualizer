import { FacebookService } from '../services/facebook_service';

let facebookService: FacebookService | null = null;

export function createFacebookService(): FacebookService {
  if (!facebookService) {
    facebookService = new FacebookService();
  }
  return facebookService;
} 