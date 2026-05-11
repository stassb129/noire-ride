'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/utils/fetchWithAuth';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import styles from '../bookings/bookings.module.scss';

interface Route {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  pricePerSeat: number;
  totalSeats: number;
  isActive: boolean;
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Route>>({});
  const [creating, setCreating] = useState(false);
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id'>>({
    from: '',
    to: '',
    distanceKm: 0,
    pricePerSeat: 0,
    totalSeats: 4,
    isActive: true
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/routes`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (route: Route) => {
    setEditingId(route.id);
    setEditData({ ...route });
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/routes/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
        }
      );
      if (!response.ok) throw new Error('Failed to update');
      await fetchRoutes();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот маршрут?')) return;

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/routes/${id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete');
      await fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/routes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRoute),
        }
      );
      if (!response.ok) throw new Error('Failed to create');
      await fetchRoutes();
      setCreating(false);
      setNewRoute({
        from: '',
        to: '',
        distanceKm: 0,
        pricePerSeat: 0,
        totalSeats: 4,
        isActive: true
      });
    } catch (error) {
      console.error('Error creating route:', error);
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
        <h1>Управление маршрутами</h1>
        <button
          className={styles.typeFilters}
          style={{ padding: '12px 24px', background: '#C6A85B', color: '#0A0A0A', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          onClick={() => setCreating(!creating)}
        >
          {creating ? 'Отмена' : '+ Добавить маршрут'}
        </button>
      </div>

      {creating && (
        <div className={styles.tableContainer} style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#eaeaea' }}>Новый маршрут</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>Откуда</label>
              <input
                type="text"
                value={newRoute.from}
                onChange={(e) => setNewRoute({ ...newRoute, from: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#eaeaea' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>Куда</label>
              <input
                type="text"
                value={newRoute.to}
                onChange={(e) => setNewRoute({ ...newRoute, to: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#eaeaea' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>Расстояние (км)</label>
              <input
                type="number"
                value={newRoute.distanceKm}
                onChange={(e) => setNewRoute({ ...newRoute, distanceKm: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#eaeaea' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>Цена за место (₽)</label>
              <input
                type="number"
                value={newRoute.pricePerSeat}
                onChange={(e) => setNewRoute({ ...newRoute, pricePerSeat: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#eaeaea' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>Всего мест</label>
              <input
                type="number"
                value={newRoute.totalSeats}
                onChange={(e) => setNewRoute({ ...newRoute, totalSeats: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#eaeaea' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>Статус</label>
              <CustomSelect
                value={newRoute.isActive ? 'true' : 'false'}
                onChange={(value) => setNewRoute({ ...newRoute, isActive: value === 'true' })}
                options={[
                  { value: 'true', label: 'Активен' },
                  { value: 'false', label: 'Неактивен' },
                ]}
                variant="boxed"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            style={{ marginTop: '16px', padding: '10px 24px', background: '#C6A85B', color: '#0A0A0A', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Создать маршрут
          </button>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Маршрут</th>
              <th>Расстояние</th>
              <th>Цена/место</th>
              <th>Мест</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                {editingId === route.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editData.from || ''}
                        onChange={(e) => setEditData({ ...editData, from: e.target.value })}
                        placeholder="Откуда"
                        style={{ width: '45%', marginRight: '5px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                      />
                      →
                      <input
                        type="text"
                        value={editData.to || ''}
                        onChange={(e) => setEditData({ ...editData, to: e.target.value })}
                        placeholder="Куда"
                        style={{ width: '45%', marginLeft: '5px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editData.distanceKm || 0}
                        onChange={(e) => setEditData({ ...editData, distanceKm: Number(e.target.value) })}
                        style={{ width: '80px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                      /> км
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editData.pricePerSeat || 0}
                        onChange={(e) => setEditData({ ...editData, pricePerSeat: Number(e.target.value) })}
                        style={{ width: '100px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                      /> ₽
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editData.totalSeats || 0}
                        onChange={(e) => setEditData({ ...editData, totalSeats: Number(e.target.value) })}
                        style={{ width: '60px', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#eaeaea' }}
                      />
                    </td>
                    <td>
                      <CustomSelect
                        value={editData.isActive ? 'true' : 'false'}
                        onChange={(value) => setEditData({ ...editData, isActive: value === 'true' })}
                        options={[
                          { value: 'true', label: 'Активен' },
                          { value: 'false', label: 'Неактивен' },
                        ]}
                        variant="boxed"
                      />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.saveBtn} onClick={() => handleSave(route.id)}>✓</button>
                        <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>✕</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td><strong>{route.from}</strong> → <strong>{route.to}</strong></td>
                    <td>{route.distanceKm} км</td>
                    <td style={{ color: '#C6A85B', fontWeight: '600' }}>{route.pricePerSeat.toLocaleString()} ₽</td>
                    <td>{route.totalSeats}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${route.isActive ? styles.confirmed : styles.cancelled}`}>
                        {route.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => handleEdit(route)}>Изменить</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(route.id)}>Удалить</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {routes.length === 0 && (
          <p className={styles.noData}>Маршруты не найдены</p>
        )}
      </div>
    </div>
  );
}
