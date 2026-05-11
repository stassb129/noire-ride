import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class CreateRouteBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  vehicleClass: string;

  @IsNumber()
  passengers: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateAirportBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string; // 'pickup' or 'dropoff'

  @IsString()
  @IsNotEmpty()
  airport: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsOptional()
  flightNumber?: string;

  @IsString()
  @IsNotEmpty()
  vehicleClass: string;

  @IsNumber()
  passengers: number;

  @IsNumber()
  luggage: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateHourlyBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  hours: number;

  @IsString()
  @IsNotEmpty()
  vehicleClass: string;

  @IsNumber()
  passengers: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
