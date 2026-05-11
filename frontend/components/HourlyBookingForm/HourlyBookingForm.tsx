'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import styles from '../RouteBookingForm/RouteBookingForm.module.scss';

export default function HourlyBookingForm() {
  const locale = useLocale();
  
  // Функция для получения завтрашней даты
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const minDate = getTomorrowDate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pickupAddress: '',
    date: '',
    time: '',
    hours: 3,
    vehicleClass: 'business',
    passengers: 1,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/hourly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        pickupAddress: '',
        date: '',
        time: '',
        hours: 3,
        vehicleClass: 'business',
        passengers: 1,
        notes: ''
      });
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateDate = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Проверяем только при потере фокуса и если дата полностью введена
    if (value && value.length === 10 && value < minDate) {
      setFormData(prev => ({ ...prev, date: minDate }));
    }
  };

  const calculatePrice = () => {
    const prices: Record<string, number> = {
      business: 1500,
      comfort: 2000,
      minivan: 2500,
      luxury: 3000
    };
    return (prices[formData.vehicleClass] || 0) * formData.hours;
  };

  return (
    <motion.div 
      className={styles.form}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className={styles.title}>
        {locale === 'ru' ? 'Почасовая аренда' : 'Hourly rental'}
      </h3>

      <form onSubmit={handleSubmit} className={styles.formContent}>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Ваше имя' : 'Your name'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={locale === 'ru' ? 'Иван Иванов' : 'John Doe'}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Телефон' : 'Phone'}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 999 123 45 67"
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Адрес подачи' : 'Pickup address'}
          </label>
          <input
            type="text"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            placeholder={locale === 'ru' ? 'Откуда подать автомобиль' : 'Where to pick you up'}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Дата' : 'Date'}
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onBlur={validateDate}
              min={minDate}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Время' : 'Time'}
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Количество часов' : 'Hours'}
            </label>
            <select
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="3">{locale === 'ru' ? '3 часа' : '3 hours'}</option>
              <option value="4">{locale === 'ru' ? '4 часа' : '4 hours'}</option>
              <option value="5">{locale === 'ru' ? '5 часов' : '5 hours'}</option>
              <option value="6">{locale === 'ru' ? '6 часов' : '6 hours'}</option>
              <option value="8">{locale === 'ru' ? '8 часов' : '8 hours'}</option>
              <option value="10">{locale === 'ru' ? '10 часов' : '10 hours'}</option>
              <option value="12">{locale === 'ru' ? '12 часов' : '12 hours'}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Пассажиров' : 'Passengers'}
            </label>
            <input
              type="number"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              min="1"
              max="8"
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Класс автомобиля' : 'Vehicle class'}
          </label>
          <select
            name="vehicleClass"
            value={formData.vehicleClass}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="business">
              {locale === 'ru' ? 'Бизнес - 1500₽/ч' : 'Business - 1500₽/h'}
            </option>
            <option value="comfort">
              {locale === 'ru' ? 'Комфорт - 2000₽/ч' : 'Comfort - 2000₽/h'}
            </option>
            <option value="minivan">
              {locale === 'ru' ? 'Минивэн - 2500₽/ч' : 'Minivan - 2500₽/h'}
            </option>
            <option value="luxury">
              {locale === 'ru' ? 'Люкс - 3000₽/ч' : 'Luxury - 3000₽/h'}
            </option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <div style={{ 
            padding: '16px', 
            background: 'rgba(198, 168, 91, 0.1)', 
            border: '1px solid rgba(198, 168, 91, 0.3)',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#C6A85B', fontSize: '20px', fontWeight: '700' }}>
              {locale === 'ru' ? 'Примерная стоимость: ' : 'Estimated cost: '}
              {calculatePrice()}₽
            </span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {locale === 'ru' ? 'Комментарий (необязательно)' : 'Comment (optional)'}
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder={locale === 'ru' ? 'Дополнительные пожелания...' : 'Additional requests...'}
            className={styles.textarea}
            rows={3}
          />
        </div>

        {status === 'success' && (
          <motion.p 
            className={styles.success}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {locale === 'ru' ? 'Заявка отправлена! Мы свяжемся с вами для подтверждения.' : 'Request sent! We will contact you for confirmation.'}
          </motion.p>
        )}

        {status === 'error' && (
          <motion.p 
            className={styles.error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {locale === 'ru' ? 'Ошибка отправки. Попробуйте позже.' : 'Submission error. Try later.'}
          </motion.p>
        )}

        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting 
            ? (locale === 'ru' ? 'Отправка...' : 'Sending...') 
            : (locale === 'ru' ? 'Забронировать' : 'Book now')}
        </motion.button>

        <p className={styles.notice}>
          {locale === 'ru' 
            ? 'Минимальная аренда - 3 часа. Мы свяжемся с вами для уточнения маршрута.'
            : 'Minimum rental - 3 hours. We will contact you to clarify the route.'}
        </p>
      </form>
    </motion.div>
  );
}
