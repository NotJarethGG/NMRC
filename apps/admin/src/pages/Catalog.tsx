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
  const [editCat, setEditCat] = useState<{ id: string; name: string } | null>(null);
  const [editCol, setEditCol] = useState<{ id: string; name: string } | null>(null);

  const addCategory = async () => {
    if (!catName.trim()) return;
    await api.post('/categories', { name: catName });
    setCatName('');
    qc.invalidateQueries({ queryKey: ['categories'] });
  };
  const saveCategory = async () => {
    if (!editCat || !editCat.name.trim()) return;
    await api.patch(`/categories/${editCat.id}`, { name: editCat.name });
    setEditCat(null);
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
  const saveCollection = async () => {
    if (!editCol || !editCol.name.trim()) return;
    await api.patch(`/collections/${editCol.id}`, { name: editCol.name });
    setEditCol(null);
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
              <li key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-line text-sm">
                {editCat?.id === c.id ? (
                  <>
                    <input
                      autoFocus
                      className="field py-1.5"
                      value={editCat.name}
                      onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && saveCategory()}
                    />
                    <div className="flex gap-3 shrink-0">
                      <button onClick={saveCategory} className="text-ink text-xs hover:underline">Guardar</button>
                      <button onClick={() => setEditCat(null)} className="text-stone text-xs hover:underline">Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{c.name}</span>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => setEditCat({ id: c.id, name: c.name })} className="text-ink text-xs hover:underline">
                        Editar
                      </button>
                      <button onClick={() => delCategory(c.id)} className="text-red-700 text-xs hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
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
              <li key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-line text-sm">
                {editCol?.id === c.id ? (
                  <>
                    <input
                      autoFocus
                      className="field py-1.5"
                      value={editCol.name}
                      onChange={(e) => setEditCol({ ...editCol, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && saveCollection()}
                    />
                    <div className="flex gap-3 shrink-0">
                      <button onClick={saveCollection} className="text-ink text-xs hover:underline">Guardar</button>
                      <button onClick={() => setEditCol(null)} className="text-stone text-xs hover:underline">Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{c.name}</span>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => setEditCol({ id: c.id, name: c.name })} className="text-ink text-xs hover:underline">
                        Editar
                      </button>
                      <button onClick={() => delCollection(c.id)} className="text-red-700 text-xs hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
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
