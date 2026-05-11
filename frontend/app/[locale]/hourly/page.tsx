'use client';

import { useLocale } from 'next-intl';
import HourlyBookingForm from '@/components/HourlyBookingForm/HourlyBookingForm';
import { MapPin, Clock, BriefcaseBusiness } from 'lucide-react';
import styles from './hourly.module.scss';

export default function HourlyPage() {
  const locale = useLocale();

  return (
    <div className={styles.hourlyPage}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {locale === 'ru' ? 'Почасовая аренда' : 'Hourly rental'}
        </h1>

        <p className={styles.description}>
          {locale === 'ru' 
            ? 'Возьмите автомобиль с водителем на несколько часов для деловых встреч, поездок по городу или личных дел. Минимальная аренда — 3 часа.'
            : 'Rent a car with a driver for several hours for business meetings, city trips or personal errands. Minimum rental — 3 hours.'}
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <MapPin className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Гибкие маршруты' : 'Flexible routes'}</h3>
            <p>{locale === 'ru' ? 'Планируйте маршрут по своему усмотрению' : 'Plan your route as you wish'}</p>
          </div>
          <div className={styles.feature}>
            <Clock className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Без ожидания' : 'No waiting'}</h3>
            <p>{locale === 'ru' ? 'Водитель ждёт вас в течение всей аренды' : 'Driver waits for you during entire rental'}</p>
          </div>
          <div className={styles.feature}>
            <BriefcaseBusiness className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Оптимальный выбор' : 'Best choice'}</h3>
            <p>{locale === 'ru' ? 'Для деловых встреч и многочисленных остановок' : 'For business meetings and multiple stops'}</p>
          </div>
        </div>

        <div className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>
            {locale === 'ru' ? 'Забронировать аренду' : 'Book rental'}
          </h2>
          <HourlyBookingForm />
        </div>
      </div>
    </div>
  );
}