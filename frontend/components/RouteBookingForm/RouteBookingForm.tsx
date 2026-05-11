'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import styles from './RouteBookingForm.module.scss';

interface RouteBookingFormProps {
  prefilledData?: {
    from?: string;
    to?: string;
    date?: string;
  };
}

export default function RouteBookingForm({ prefilledData }: RouteBookingFormProps) {
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
    from: 'Москва',
    to: 'Санкт-Петербург',
    date: '',
    time: '',
    passengers: 1,
    vehicleClass: 'business',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Обновляем форму когда приходят предзаполненные данные
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        ...prefilledData
      }));
    }
  }, [prefilledData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceType: 'route'
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        from: 'Москва',
        to: 'Санкт-Петербург',
        date: '',
        time: '',
        passengers: 1,
        vehicleClass: 'business',
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

  return (
    <motion.div 
      className={styles.form}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className={styles.title}>
        {locale === 'ru' ? 'Забронировать поездку' : 'Book a trip'}
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

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Откуда' : 'From'}
            </label>
            <select
              name="from"
              value={formData.from}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="Москва">Москва</option>
              <option value="Санкт-Петербург">Санкт-Петербург</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {locale === 'ru' ? 'Куда' : 'To'}
            </label>
            <select
              name="to"
              value={formData.to}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="Санкт-Петербург">Санкт-Петербург</option>
              <option value="Москва">Москва</option>
            </select>
          </div>
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
                {locale === 'ru' ? 'Бизнес (80₽/км)' : 'Business (80₽/km)'}
              </option>
              <option value="comfort">
                {locale === 'ru' ? 'Комфорт (100₽/км)' : 'Comfort (100₽/km)'}
              </option>
              <option value="minivan">
                {locale === 'ru' ? 'Минивэн (120₽/км)' : 'Minivan (120₽/km)'}
              </option>
              <option value="luxury">
                {locale === 'ru' ? 'Люкс (150₽/км)' : 'Luxury (150₽/km)'}
              </option>
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
            : (locale === 'ru' ? 'Забронировать поездку' : 'Book trip')}
        </motion.button>

        <p className={styles.notice}>
          {locale === 'ru' 
            ? 'Мы свяжемся с вами для подтверждения деталей и расчета итоговой стоимости'
            : 'We will contact you to confirm details and calculate the final cost'}
        </p>
      </form>
    </motion.div>
  );
}
