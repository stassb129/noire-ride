'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/utils/fetchWithAuth';
import styles from './bookings.module.scss';

type BookingType = 'contacts' | 'routes' | 'airport' | 'hourly';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface BaseBooking {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  createdAt: string;
  notes?: string;
}

interface Contact extends BaseBooking {
  source: string;
}

interface RouteBooking extends BaseBooking {
  from: string;
  to: string;
  date: string;
  time: string;
  vehicleClass: string;
  passengers: number;
}

interface AirportBooking extends BaseBooking {
  serviceType: string;
  airport: string;
  address: string;
  date: string;
  time: string;
  flightNumber?: string;
  vehicleClass: string;
  passengers: number;
  luggage: number;
}

interface HourlyBooking extends BaseBooking {
  pickupAddress: string;
  date: string;
  time: string;
  hours: number;
  vehicleClass: string;
  passengers: number;
}

type AnyBooking = Contact | RouteBooking | AirportBooking | HourlyBooking;

export default function AllBookingsPage() {
  const [bookingType, setBookingType] = useState<BookingType>('contacts');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [bookings, setBookings] = useState<AnyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [bookingType]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoints: Record<BookingType, string> = {
        contacts: '/contacts',
        routes: '/bookings/route',
        airport: '/bookings/airport',
        hourly: '/bookings/hourly'
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints[bookingType]}`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const endpoints: Record<BookingType, string> = {
        contacts: `/contacts/${id}`,
        routes: `/bookings/route/${id}`,
        airport: `/bookings/airport/${id}`,
        hourly: `/bookings/hourly/${id}`
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints[bookingType]}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error('Failed to update');
      fetchBookings();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm('Удалить эту заявку?')) return;

    try {
      const endpoints: Record<BookingType, string> = {
        contacts: `/contacts/${id}`,
        routes: `/bookings/route/${id}`,
        airport: `/bookings/airport/${id}`,
        hourly: `/bookings/hourly/${id}`
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints[bookingType]}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  const getTypeLabel = (type: BookingType) => {
    const labels = {
      contacts: 'Заявки',
      routes: 'Маршруты',
      airport: 'Аэропорт',
      hourly: 'Почасовая'
    };
    return labels[type];
  };

  const getStatusCounts = () => {
    const counts = {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
    return counts;
  };

  const counts = getStatusCounts();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Все заявки</h1>
        
        <div className={styles.typeFilters}>
          <button
            className={bookingType === 'contacts' ? styles.active : ''}
            onClick={() => setBookingType('contacts')}
          >
            📞 Заявки
          </button>
          <button
            className={bookingType === 'routes' ? styles.active : ''}
            onClick={() => setBookingType('routes')}
          >
            🛣️ Маршруты
          </button>
          <button
            className={bookingType === 'airport' ? styles.active : ''}
            onClick={() => setBookingType('airport')}
          >
            ✈️ Аэропорт
          </button>
          <button
            className={bookingType === 'hourly' ? styles.active : ''}
            onClick={() => setBookingType('hourly')}
          >
            ⏱️ Почасовая
          </button>
        </div>

        <div className={styles.statusFilters}>
          <button
            className={statusFilter === 'all' ? styles.active : ''}
            onClick={() => setStatusFilter('all')}
          >
            Все ({counts.all})
          </button>
          <button
            className={statusFilter === 'pending' ? styles.active : ''}
            onClick={() => setStatusFilter('pending')}
          >
            Новые ({counts.pending})
          </button>
          <button
            className={statusFilter === 'confirmed' ? styles.active : ''}
            onClick={() => setStatusFilter('confirmed')}
          >
            Подтверждённые ({counts.confirmed})
          </button>
          <button
            className={statusFilter === 'completed' ? styles.active : ''}
            onClick={() => setStatusFilter('completed')}
          >
            Завершённые ({counts.completed})
          </button>
          {bookingType !== 'contacts' && (
            <button
              className={statusFilter === 'cancelled' ? styles.active : ''}
              onClick={() => setStatusFilter('cancelled')}
            >
              Отменённые ({counts.cancelled})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>Загрузка...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Клиент</th>
                {bookingType === 'contacts' && <th>Источник</th>}
                {bookingType === 'routes' && <th>Маршрут</th>}
                {bookingType === 'routes' && <th>Дата/Время</th>}
                {bookingType === 'routes' && <th>Класс</th>}
                {bookingType === 'routes' && <th>Пасс.</th>}
                {bookingType === 'airport' && <th>Тип/Аэропорт</th>}
                {bookingType === 'airport' && <th>Адрес</th>}
                {bookingType === 'airport' && <th>Дата/Время</th>}
                {bookingType === 'airport' && <th>Рейс</th>}
                {bookingType === 'hourly' && <th>Адрес подачи</th>}
                {bookingType === 'hourly' && <th>Дата/Время</th>}
                {bookingType === 'hourly' && <th>Часов</th>}
                <th>Статус</th>
                <th>Создано</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>
                    <div className={styles.clientInfo}>
                      <div className={styles.clientName}>{booking.name}</div>
                      <div className={styles.clientContact}>{booking.phone}</div>
                      {booking.email && <div className={styles.clientContact}>{booking.email}</div>}
                    </div>
                  </td>
                  
                  {bookingType === 'contacts' && (
                    <td>{(booking as Contact).source}</td>
                  )}
                  
                  {bookingType === 'routes' && (
                    <>
                      <td>
                        <strong>{(booking as RouteBooking).from}</strong> → <strong>{(booking as RouteBooking).to}</strong>
                      </td>
                      <td>
                        {(booking as RouteBooking).date}<br />{(booking as RouteBooking).time}
                      </td>
                      <td>{(booking as RouteBooking).vehicleClass}</td>
                      <td>{(booking as RouteBooking).passengers}</td>
                    </>
                  )}
                  
                  {bookingType === 'airport' && (
                    <>
                      <td>
                        <div>{(booking as AirportBooking).serviceType === 'pickup' ? 'Встреча' : 'Проводы'}</div>
                        <strong>{(booking as AirportBooking).airport}</strong>
                      </td>
                      <td>{(booking as AirportBooking).address}</td>
                      <td>
                        {(booking as AirportBooking).date}<br />{(booking as AirportBooking).time}
                      </td>
                      <td>{(booking as AirportBooking).flightNumber || '—'}</td>
                    </>
                  )}
                  
                  {bookingType === 'hourly' && (
                    <>
                      <td>{(booking as HourlyBooking).pickupAddress}</td>
                      <td>
                        {(booking as HourlyBooking).date}<br />{(booking as HourlyBooking).time}
                      </td>
                      <td><strong>{(booking as HourlyBooking).hours}ч</strong></td>
                    </>
                  )}
                  
                  <td>
                    {editingId === booking.id ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="pending">Новая</option>
                        {bookingType !== 'contacts' && <option value="confirmed">Подтверждена</option>}
                        {bookingType !== 'contacts' && <option value="completed">Завершена</option>}
                        {bookingType !== 'contacts' && <option value="cancelled">Отменена</option>}
                        {bookingType === 'contacts' && <option value="contacted">Связались</option>}
                      </select>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                        {booking.status}
                      </span>
                    )}
                  </td>
                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      {editingId === booking.id ? (
                        <>
                          <button
                            className={styles.saveBtn}
                            onClick={() => updateStatus(booking.id, editStatus)}
                          >
                            ✓
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={styles.editBtn}
                            onClick={() => {
                              setEditingId(booking.id);
                              setEditStatus(booking.status);
                            }}
                          >
                            Изменить
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => deleteBooking(booking.id)}
                          >
                            Удалить
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <p className={styles.noData}>Нет заявок</p>
          )}
        </div>
      )}
    </div>
  );
}
