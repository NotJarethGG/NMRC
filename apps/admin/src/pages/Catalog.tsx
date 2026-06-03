import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCategories, useCollections } from '../hooks/useAdmin';

export function Catalog() {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();

  const [catName, setCatName] = useState('');
  const [col, setCol] = useState({ name: '', description: '', heroImage: '' });

  const addCategory = async () => {
    if (!catName.trim()) return;
    await api.post('/categories', { name: catName });
    setCatName('');
    qc.invalidateQueries({ queryKey: ['categories'] });
  };
  const delCategory = async (id: string) => {
    if (!confirm('¿Eliminar categoría?')) return;
    await api.delete(`/categories/${id}`).catch(() => alert('No se puede: tiene productos asociados.'));
    qc.invalidateQueries({ queryKey: ['categories'] });
  };

  const addCollection = async () => {
    if (!col.name.trim()) return;
    await api.post('/collections', col);
    setCol({ name: '', description: '', heroImage: '' });
    qc.invalidateQueries({ queryKey: ['collections'] });
  };
  const delCollection = async (id: string) => {
    if (!confirm('¿Eliminar colección?')) return;
    await api.delete(`/collections/${id}`).catch(() => alert('No se puede: tiene productos asociados.'));
    qc.invalidateQueries({ queryKey: ['collections'] });
  };

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Organización</span>
        <h1 className="font-display text-4xl mt-1">Catálogo</h1>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* CATEGORÍAS */}
        <div className="card p-6">
          <p className="eyebrow mb-5">Categorías</p>
          <ul className="space-y-2 mb-5">
            {categories?.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 border-b border-line text-sm">
                <span>{c.name}</span>
                <button onClick={() => delCategory(c.id)} className="text-red-700 text-xs hover:underline">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <input
              className="field"
              placeholder="Nueva categoría"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <button onClick={addCategory} className="btn shrink-0">
              Añadir
            </button>
          </div>
        </div>

        {/* COLECCIONES */}
        <div className="card p-6">
          <p className="eyebrow mb-5">Colecciones</p>
          <ul className="space-y-2 mb-5">
            {collections?.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 border-b border-line text-sm">
                <span>{c.name}</span>
                <button onClick={() => delCollection(c.id)} className="text-red-700 text-xs hover:underline">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            <input
              className="field"
              placeholder="Nombre"
              value={col.name}
              onChange={(e) => setCol({ ...col, name: e.target.value })}
            />
            <input
              className="field"
              placeholder="Descripción"
              value={col.description}
              onChange={(e) => setCol({ ...col, description: e.target.value })}
            />
            <input
              className="field"
              placeholder="URL imagen hero"
              value={col.heroImage}
              onChange={(e) => setCol({ ...col, heroImage: e.target.value })}
            />
            <button onClick={addCollection} className="btn w-full">
              Crear colección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
