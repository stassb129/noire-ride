'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { apiClient, Route, AvailableSeats } from '@/lib/api/client';
import RouteBookingForm from '@/components/RouteBookingForm/RouteBookingForm';
import { Navigation, Tag, Sparkles } from 'lucide-react';
import styles from './routes.module.scss';

export default function RoutesPage() {
  const locale = useLocale();
  
  // Инициализируем дату завтрашним днём
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const minDate = getTomorrowDate();
  
  const [selectedDate, setSelectedDate] = useState(minDate);
  const [debouncedDate, setDebouncedDate] = useState(minDate);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [availability, setAvailability] = useState<Record<string, AvailableSeats>>({});
  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [prefilledFormData, setPrefilledFormData] = useState<{
    from?: string;
    to?: string;
    date?: string;
  }>();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const validateDate = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Проверяем только при потере фокуса и если дата полностью введена
    if (value && value.length === 10 && value < minDate) {
      setSelectedDate(minDate);
    }
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await apiClient.getAllRoutes();
        setRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // Дебаунс для даты (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDate(selectedDate);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDate]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (routes.length === 0) return;

      setLoadingAvailability(true);
      const availabilityData: Record<string, AvailableSeats> = {};
      
      for (const route of routes) {
        try {
          const seats = await apiClient.getAvailableSeats(route.id, debouncedDate);
          availabilityData[route.id] = seats;
        } catch (error) {
          console.error(`Error fetching availability for route ${route.id}:`, error);
        }
      }

      setAvailability(availabilityData);
      setLoadingAvailability(false);
    };

    fetchAvailability();
  }, [routes, debouncedDate]);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-form');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookRoute = (route: Route) => {
    // Устанавливаем предзаполненные данные
    setPrefilledFormData({
      from: route.from,
      to: route.to,
      date: selectedDate
    });
    // Прокручиваем к форме
    scrollToBooking();
  };

  return (
    <div className={styles.routesPage}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {locale === 'ru' ? 'Маршруты между городами' : 'Intercity routes'}
        </h1>

        <p className={styles.description}>
          {locale === 'ru' 
            ? 'Комфортные междугородние поездки с фиксированной стоимостью. Путешествуйте между Москвой и Санкт-Петербургом с максимальным комфортом.'
            : 'Comfortable intercity trips at fixed prices. Travel between Moscow and Saint Petersburg in maximum comfort.'}
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <Navigation className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Прямой маршрут' : 'Direct route'}</h3>
            <p>{locale === 'ru' ? 'Без дополнительных остановок' : 'No extra stops'}</p>
          </div>
          <div className={styles.feature}>
            <Tag className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Фиксированная цена' : 'Fixed price'}</h3>
            <p>{locale === 'ru' ? 'Никаких доплат за километры' : 'No extra charges per kilometer'}</p>
          </div>
          <div className={styles.feature}>
            <Sparkles className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Премиум комфорт' : 'Premium comfort'}</h3>
            <p>{locale === 'ru' ? 'Бизнес и люкс автомобили' : 'Business and luxury vehicles'}</p>
          </div>
        </div>

        <div className={styles.availabilitySection}>
          <h2 className={styles.sectionTitle}>
            {locale === 'ru' ? 'Доступные рейсы' : 'Available routes'}
          </h2>

          <div className={styles.dateSelector}>
            <label className={styles.dateLabel}>
              {locale === 'ru' ? 'Выберите дату' : 'Select date'}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              onBlur={validateDate}
              className={styles.dateInput}
              min={minDate}
            />
          </div>

          {loading ? (
            <p className={styles.loading}>
              {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
            </p>
          ) : (
            <div className={styles.routesList}>
              {routes.map((route) => {
                const seats = availability[route.id];
                
                return (
                  <div key={route.id} className={styles.route}>
                    <div className={styles.routeHeader}>
                      <div className={styles.routeDirection}>
                        <span className={styles.routeCity}>{route.from}</span>
                        <span className={styles.routeArrow}>→</span>
                        <span className={styles.routeCity}>{route.to}</span>
                      </div>
                      <div className={styles.routePrice}>
                        {route.pricePerSeat.toLocaleString()}₽ {locale === 'ru' ? 'за место' : 'per seat'}
                      </div>
                    </div>

                    {seats ? (
                      <div className={`${styles.seatsInfo} ${loadingAvailability ? styles.loading : ''}`}>
                        <div className={styles.seatIndicators}>
                          {[...Array(seats.totalSeats)].map((_, i) => (
                            <div
                              key={i}
                              className={`${styles.seatDot} ${
                                i < seats.availableSeats ? styles.seatAvailable : styles.seatTaken
                              }`}
                            />
                          ))}
                        </div>
                        <span className={styles.seatStatus}>
                          {seats.availableSeats === 0
                            ? (locale === 'ru' ? 'Нет мест' : 'Sold out')
                            : locale === 'ru' 
                              ? `Свободно: ${seats.availableSeats} ${seats.availableSeats === 1 ? 'место' : seats.availableSeats < 5 ? 'места' : 'мест'}`
                              : `Available: ${seats.availableSeats} ${seats.availableSeats === 1 ? 'seat' : 'seats'}`
                          }
                        </span>
                      </div>
                    ) : (
                      <p className={styles.loadingSeats}>
                        {locale === 'ru' ? 'Загрузка мест...' : 'Loading seats...'}
                      </p>
                    )}

                    <button
                      disabled={!seats || seats.availableSeats === 0}
                      className={styles.selectButton}
                      onClick={() => handleBookRoute(route)}
                    >
                      {locale === 'ru' ? 'Забронировать' : 'Book now'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && routes.length === 0 && (
            <p className={styles.noRoutes}>
              {locale === 'ru' ? 'Маршруты не найдены' : 'No routes available'}
            </p>
          )}
        </div>

        <div id="booking-form" className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>
            {locale === 'ru' ? 'Забронировать поездку' : 'Book a trip'}
          </h2>
          <RouteBookingForm prefilledData={prefilledFormData} />
        </div>
      </div>
    </div>
  );
}