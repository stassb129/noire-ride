import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from '../entities/booking.entity';
import { Route } from '../entities/route.entity';
import { RouteBooking, AirportBooking, HourlyBooking } from '../entities/specialized-bookings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Route, RouteBooking, AirportBooking, HourlyBooking])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
