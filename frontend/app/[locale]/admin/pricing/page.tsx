'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/utils/fetchWithAuth';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import styles from '../bookings/bookings.module.scss';

interface HourlyPricing {
  id: string;
  vehicleName: string;
  vehicleClass: string;
  pricePerHour: number;
  minimumHours: number;
}

interface AirportPricing {
  id: string;
  vehicleName: string;
  vehicleClass: string;
  airportCode: string;
  airportName?: string;
  direction: string;
  price: number;
}

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<'hourly' | 'airport'>('hourly');
  const [hourlyPricing, setHourlyPricing] = useState<HourlyPricing[]>([]);
  const [airportPricing, setAirportPricing] = useState<AirportPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState<any>({});

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

  const handleSaveHourly = async (id: string) => {
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

  const handleSaveAirport = async (id: string) => {
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

  const handleDeleteHourly = async (id: string) => {
    if (!confirm('Удалить эту запись цены?')) return;

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/pricing/hourly/${id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete');
      await fetchPricing();
    } catch (error) {
      console.error('Error deleting hourly pricing:', error);
    }
  };

  const handleDeleteAirport = async (id: string) => {
    if (!confirm('Удалить эту запись цены?')) return;

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/pricing/airport/${id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete');
      await fetchPricing();
    } catch (error) {
      console.error('Error deleting airport pricing:', error);
    }
  };

  const getAirportName = (code: string) => {
    if (code === 'SVO') return 'Sheremetyevo';
    if (code === 'DME') return 'Domodedovo';
    if (code === 'VKO') return 'Vnukovo';
    return code;
  };

  const handleCreateHourly = async () => {
    try {
      const payload = {
        vehicleName: createData.vehicleName || 'New vehicle',
        vehicleClass: createData.vehicleClass || 'business',
        pricePerHour: Number(createData.pricePerHour || 0),
        minimumHours: Number(createData.minimumHours || 3),
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/pricing/hourly`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error('Failed to create');
      await fetchPricing();
      setCreating(false);
      setCreateData({});
    } catch (error) {
      console.error('Error creating hourly pricing:', error);
    }
  };

  const handleCreateAirport = async () => {
    try {
      const airportCode = createData.airportCode || 'SVO';
      const payload = {
        vehicleName: createData.vehicleName || 'New vehicle',
        vehicleClass: createData.vehicleClass || 'business',
        airportCode,
        airportName: getAirportName(airportCode),
        direction: createData.direction || 'to_airport',
        price: Number(createData.price || 0),
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/pricing/airport`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error('Failed to create');
      await fetchPricing();
      setCreating(false);
      setCreateData({});
    } catch (error) {
      console.error('Error creating airport pricing:', error);
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

        <button
          className={creating ? styles.cancelBtn : styles.editBtn}
          onClick={() => {
            setCreating(!creating);
            setCreateData({});
          }}
        >
          {creating ? 'Отмена' : '+ Добавить запись цены'}
        </button>
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
              {creating && (
                <tr>
                  <td>
                    <input
                      type="text"
                      value={createData.vehicleName || ''}
                      onChange={(e) => setCreateData({ ...createData, vehicleName: e.target.value })}
                      style={{ width: '100%', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                      placeholder="Название авто"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={createData.pricePerHour || 0}
                      onChange={(e) => setCreateData({ ...createData, pricePerHour: Number(e.target.value) })}
                      style={{ width: '120px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                    /> ₽
                  </td>
                  <td>
                    <input
                      type="number"
                      value={createData.minimumHours || 3}
                      onChange={(e) => setCreateData({ ...createData, minimumHours: Number(e.target.value) })}
                      style={{ width: '80px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                    /> ч
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.saveBtn} onClick={handleCreateHourly}>Создать</button>
                      <button className={styles.cancelBtn} onClick={() => setCreating(false)}>✕</button>
                    </div>
                  </td>
                </tr>
              )}
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
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteHourly(item.id)}
                        >
                          Удалить
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
              {creating && (
                <tr>
                  <td>
                    <input
                      type="text"
                      value={createData.vehicleName || ''}
                      onChange={(e) => setCreateData({ ...createData, vehicleName: e.target.value })}
                      style={{ width: '100%', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                      placeholder="Название авто"
                    />
                  </td>
                  <td>
                    <CustomSelect
                      value={createData.airportCode || 'SVO'}
                      onChange={(value) => setCreateData({ ...createData, airportCode: value })}
                      options={[
                        { value: 'SVO', label: 'SVO' },
                        { value: 'DME', label: 'DME' },
                        { value: 'VKO', label: 'VKO' },
                      ]}
                      variant="boxed"
                    />
                  </td>
                  <td>
                    <CustomSelect
                      value={createData.direction || 'to_airport'}
                      onChange={(value) => setCreateData({ ...createData, direction: value })}
                      options={[
                        { value: 'to_airport', label: 'В аэропорт' },
                        { value: 'from_airport', label: 'Из аэропорта' },
                      ]}
                      variant="boxed"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={createData.price || 0}
                      onChange={(e) => setCreateData({ ...createData, price: Number(e.target.value) })}
                      style={{ width: '120px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                    /> ₽
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.saveBtn} onClick={handleCreateAirport}>Создать</button>
                      <button className={styles.cancelBtn} onClick={() => setCreating(false)}>✕</button>
                    </div>
                  </td>
                </tr>
              )}
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
                        <CustomSelect
                          value={editData.airportCode || 'SVO'}
                          onChange={(value) => setEditData({ ...editData, airportCode: value })}
                          options={[
                            { value: 'SVO', label: 'SVO' },
                            { value: 'DME', label: 'DME' },
                            { value: 'VKO', label: 'VKO' },
                          ]}
                          variant="boxed"
                        />
                      </td>
                      <td>
                        <CustomSelect
                          value={editData.direction || 'to_airport'}
                          onChange={(value) => setEditData({ ...editData, direction: value })}
                          options={[
                            { value: 'to_airport', label: 'В аэропорт' },
                            { value: 'from_airport', label: 'Из аэропорта' },
                          ]}
                          variant="boxed"
                        />
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
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteAirport(item.id)}
                        >
                          Удалить
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
