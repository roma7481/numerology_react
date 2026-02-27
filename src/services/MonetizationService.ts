// Legacy wrapper — delegates to AdService
import { adService } from './AdService';

class MonetizationService {
    async init() {
        await adService.init();
    }
}

export const monetizationService = new MonetizationService();
