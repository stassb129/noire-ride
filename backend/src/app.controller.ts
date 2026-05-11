import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { BookingService } from './booking/booking.service';
import { PricingService } from './pricing/pricing.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly bookingService: BookingService,
    private readonly pricingService: PricingService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed/all')
  async seedAll() {
    // Existing seed methods are idempotent:
    // they add data only when target tables are empty.
    await this.authService.seedDefaultAdmin();
    await this.bookingService.seedRoutes();
    await this.pricingService.seedInitialPricing();

    return {
      message: 'Global seed completed (existing data was preserved)',
      seeded: ['admin', 'routes', 'pricing'],
    };
  }
}
