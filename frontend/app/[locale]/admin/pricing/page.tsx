'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/utils/fetchWithAuth';
import styles from '../bookings/bookings.module.scss';

interface HourlyPricing {
  id: number;
  vehicleName: string;
  vehicleClass: string;
  pricePerHour: number;
  minimumHours: number;
}

interface AirportPricing {
  id: number;
  vehicleName: string;
  vehicleClass: string;
  airportCode: string;
  direction: string;
  price: number;
}

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<'hourly' | 'airport'>('hourly');
  const [hourlyPricing, setHourlyPricing] = useState<HourlyPricing[]>([]);
  const [airportPricing, setAirportPricing] = useState<AirportPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const [hourly, airport] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing/hourly`).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing/airport`).then(r => r.json()),
      ]);
      setHourlyPricing(hourly);
      setAirportPricing(airport);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHourly = async (id: number) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/pricing/hourly/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
        }
      );
      if (!response.ok) throw new Error('Failed to update');
      await fetchPricing();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating hourly pricing:', error);
    }
  };

  const handleSaveAirport = async (id: number) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/pricing/airport/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
        }
      );
      if (!response.ok) throw new Error('Failed to update');
      await fetchPricing();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating airport pricing:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Управление ценами</h1>
        
        <div className={styles.typeFilters}>
          <button
            className={activeTab === 'hourly' ? styles.active : ''}
            onClick={() => setActiveTab('hourly')}
          >
            ⏱️ Почасовая аренда
          </button>
          <button
            className={activeTab === 'airport' ? styles.active : ''}
            onClick={() => setActiveTab('airport')}
          >
            ✈️ Аэропорт
          </button>
        </div>
      </div>

      {activeTab === 'hourly' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Класс автомобиля</th>
                <th>Цена/час</th>
                <th>Минимум часов</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {hourlyPricing.map((item) => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editData.vehicleName || ''}
                          onChange={(e) => setEditData({ ...editData, vehicleName: e.target.value })}
                          style={{ width: '100%', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editData.pricePerHour || 0}
                          onChange={(e) => setEditData({ ...editData, pricePerHour: Number(e.target.value) })}
                          style={{ width: '120px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                        /> ₽
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editData.minimumHours || 0}
                          onChange={(e) => setEditData({ ...editData, minimumHours: Number(e.target.value) })}
                          style={{ width: '80px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                        /> ч
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.saveBtn} onClick={() => handleSaveHourly(item.id)}>✓</button>
                          <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{item.vehicleName}</strong></td>
                      <td style={{ color: '#C6A85B', fontWeight: '600' }}>{item.pricePerHour.toLocaleString()} ₽</td>
                      <td>{item.minimumHours} ч</td>
                      <td>
                        <button 
                          className={styles.editBtn} 
                          onClick={() => {
                            setEditingId(item.id);
                            setEditData({ ...item });
                          }}
                        >
                          Изменить
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'airport' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Класс автомобиля</th>
                <th>Аэропорт</th>
                <th>Направление</th>
                <th>Цена</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {airportPricing.map((item) => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editData.vehicleName || ''}
                          onChange={(e) => setEditData({ ...editData, vehicleName: e.target.value })}
                          style={{ width: '100%', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                        />
                      </td>
                      <td>
                        <select
                          value={editData.airportCode || ''}
                          onChange={(e) => setEditData({ ...editData, airportCode: e.target.value })}
                          style={{ padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                        >
                          <option value="SVO">SVO</option>
                          <option value="DME">DME</option>
                          <option value="VKO">VKO</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={editData.direction || ''}
                          onChange={(e) => setEditData({ ...editData, direction: e.target.value })}
                          style={{ padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                        >
                          <option value="to_airport">В аэропорт</option>
                          <option value="from_airport">Из аэропорта</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editData.price || 0}
                          onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                          style={{ width: '120px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                        /> ₽
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.saveBtn} onClick={() => handleSaveAirport(item.id)}>✓</button>
                          <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{item.vehicleName}</strong></td>
                      <td>{item.airportCode}</td>
                      <td>{item.direction === 'to_airport' ? 'В аэропорт' : 'Из аэропорта'}</td>
                      <td style={{ color: '#C6A85B', fontWeight: '600' }}>{item.price.toLocaleString()} ₽</td>
                      <td>
                        <button 
                          className={styles.editBtn} 
                          onClick={() => {
                            setEditingId(item.id);
                            setEditData({ ...item });
                          }}
                        >
                          Изменить
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
