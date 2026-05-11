'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { apiClient, AirportPricing } from '@/lib/api/client';
import AirportBookingForm from '@/components/AirportBookingForm/AirportBookingForm';
import { Plane, UserCheck, Tag } from 'lucide-react';
import styles from './airport.module.scss';

export default function AirportPage() {
  const locale = useLocale();
  const [pricing, setPricing] = useState<AirportPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAirport, setSelectedAirport] = useState('SVO');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await apiClient.getAirportPricing(selectedAirport);
        setPricing(data);
      } catch (error) {
        console.error('Error fetching airport pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [selectedAirport]);

  const airports = [
    { code: 'SVO', name: 'Sheremetyevo', nameRu: 'Шереметьево' },
    { code: 'DME', name: 'Domodedovo', nameRu: 'Домодедово' },
    { code: 'VKO', name: 'Vnukovo', nameRu: 'Внуково' },
  ];

  // Group pricing by direction
  const toAirport = pricing.filter(p => p.direction === 'to_airport');
  const fromAirport = pricing.filter(p => p.direction === 'from_airport');

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-form');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={styles.airportPage}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {locale === 'ru' ? 'Трансферы в аэропорт' : 'Airport transfers'}
        </h1>

        <p className={styles.description}>
          {locale === 'ru' 
            ? 'Комфортные трансферы в аэропорты Москвы. Отслеживание рейса, встреча с табличкой, помощь с багажом.'
            : 'Comfortable transfers to Moscow airports. Flight tracking, meet & greet service, luggage assistance.'}
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <Plane className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Отслеживание рейса' : 'Flight tracking'}</h3>
            <p>{locale === 'ru' ? 'Следим за изменениями и задержками' : 'We monitor changes and delays'}</p>
          </div>
          <div className={styles.feature}>
            <UserCheck className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Встреча в зале прилёта' : 'Meet & greet'}</h3>
            <p>{locale === 'ru' ? 'С именной табличкой и помощью с багажом' : 'With name sign and luggage assistance'}</p>
          </div>
          <div className={styles.feature}>
            <Tag className={styles.featureIcon} />
            <h3>{locale === 'ru' ? 'Фиксированная цена' : 'Fixed price'}</h3>
            <p>{locale === 'ru' ? 'Без учёта времени в пробках' : 'Not affected by traffic'}</p>
          </div>
        </div>

        <div className={styles.pricingSection}>
          <h2 className={styles.sectionTitle}>
            {locale === 'ru' ? 'Выберите аэропорт для просмотра цен' : 'Select airport to view pricing'}
          </h2>
          <div className={styles.airportGrid}>
            {airports.map((airport) => (
              <button
                key={airport.code}
                className={`${styles.airportCard} ${selectedAirport === airport.code ? styles.active : ''}`}
                onClick={() => setSelectedAirport(airport.code)}
              >
                <div className={styles.airportCode}>{airport.code}</div>
                <div className={styles.airportName}>
                  {locale === 'ru' ? airport.nameRu : airport.name}
                </div>
              </button>
            ))}
          </div>

          {loading ? (
            <p className={styles.loading}>
              {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
            </p>
          ) : (
            <>
              {toAirport.length > 0 && (
                <div className={styles.priceSection}>
                  <h3 className={styles.priceSectionTitle}>
                    {locale === 'ru' ? 'Москва → Аэропорт' : 'Moscow → Airport'}
                  </h3>
                  <div className={styles.pricingList}>
                    {toAirport.map((item) => (
                      <div key={item.id} className={styles.pricingItem}>
                        <div className={styles.pricingInfo}>
                          <div className={styles.pricingType}>{item.vehicleName}</div>
                        </div>
                        <div className={styles.pricingActions}>
                          <div className={styles.pricingPrice}>
                            {item.price.toLocaleString()}₽
                          </div>
                          <button 
                            className={styles.bookButton}
                            onClick={scrollToBooking}
                          >
                            {locale === 'ru' ? 'Забронировать' : 'Book'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fromAirport.length > 0 && (
                <div className={styles.priceSection}>
                  <h3 className={styles.priceSectionTitle}>
                    {locale === 'ru' ? 'Аэропорт → Москва' : 'Airport → Moscow'}
                  </h3>
                  <div className={styles.pricingList}>
                    {fromAirport.map((item) => (
                      <div key={item.id} className={styles.pricingItem}>
                        <div className={styles.pricingInfo}>
                          <div className={styles.pricingType}>{item.vehicleName}</div>
                        </div>
                        <div className={styles.pricingActions}>
                          <div className={styles.pricingPrice}>
                            {item.price.toLocaleString()}₽
                          </div>
                          <button 
                            className={styles.bookButton}
                            onClick={scrollToBooking}
                          >
                            {locale === 'ru' ? 'Забронировать' : 'Book'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div id="booking-form" className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>
            {locale === 'ru' ? 'Забронировать трансфер' : 'Book transfer'}
          </h2>
          <AirportBookingForm />
        </div>
      </div>
    </div>
  );
}