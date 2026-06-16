import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCategories, useCollections, uploadImage } from '../hooks/useAdmin';
import type { Collection } from '../lib/types';

interface ColForm {
  id: string | null;
  name: string;
  description: string;
  heroImage: string;
}
const EMPTY_COL: ColForm = { id: null, name: '', description: '', heroImage: '' };

export function Catalog() {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();

  const [catName, setCatName] = useState('');
  const [editCat, setEditCat] = useState<{ id: string; name: string } | null>(null);

  const [col, setCol] = useState<ColForm>(EMPTY_COL);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCats = () => qc.invalidateQueries({ queryKey: ['categories'] });
  const refreshCols = () => qc.invalidateQueries({ queryKey: ['collections'] });

  // --- Categorías ---
  const addCategory = async () => {
    if (!catName.trim()) return;
    await api.post('/categories', { name: catName });
    setCatName('');
    refreshCats();
  };
  const saveCategory = async () => {
    if (!editCat || !editCat.name.trim()) return;
    await api.patch(`/categories/${editCat.id}`, { name: editCat.name });
    setEditCat(null);
    refreshCats();
  };
  const delCategory = async (id: string) => {
    if (!confirm('¿Eliminar categoría?')) return;
    await api.delete(`/categories/${id}`).catch(() => alert('No se puede: tiene productos asociados.'));
    refreshCats();
  };

  // --- Colecciones ---
  const onHeroFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file); // sube a Cloudinary (mismo flujo que los productos)
      setCol((c) => ({ ...c, heroImage: url }));
    } catch {
      setError('No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const submitCollection = async () => {
    if (!col.name.trim()) return;
    setSaving(true);
    setError(null);
    const payload = {
      name: col.name.trim(),
      description: col.description.trim() || undefined,
      heroImage: col.heroImage || undefined,
    };
    try {
      if (col.id) await api.patch(`/collections/${col.id}`, payload);
      else await api.post('/collections', payload);
      setCol(EMPTY_COL);
      refreshCols();
    } catch {
      setError('No se pudo guardar la colección.');
    } finally {
      setSaving(false);
    }
  };

  const editCollection = (c: Collection) =>
    setCol({ id: c.id, name: c.name, description: c.description ?? '', heroImage: c.heroImage ?? '' });

  const delCollection = async (id: string) => {
    if (!confirm('¿Eliminar colección?')) return;
    await api.delete(`/collections/${id}`).catch(() => alert('No se puede: tiene productos asociados.'));
    if (col.id === id) setCol(EMPTY_COL);
    refreshCols();
  };

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Organización</span>
        <h1 className="font-display text-4xl mt-1">Catálogo</h1>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
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
          <ul className="space-y-2 mb-6">
            {collections?.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-line text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-12 bg-sand overflow-hidden shrink-0">
                    {c.heroImage && <img src={c.heroImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <span className="truncate">{c.name}</span>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => editCollection(c)} className="text-ink text-xs hover:underline">
                    Editar
                  </button>
                  <button onClick={() => delCollection(c.id)} className="text-red-700 text-xs hover:underline">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* EDITOR DE COLECCIÓN (crear / editar) */}
          <div className="border-t border-line pt-5 space-y-3">
            <p className="text-[11px] uppercase tracking-wide text-stone">
              {col.id ? 'Editar colección' : 'Nueva colección'}
            </p>
            <input
              className="field"
              placeholder="Nombre"
              value={col.name}
              onChange={(e) => setCol({ ...col, name: e.target.value })}
            />
            <textarea
              className="field resize-none"
              rows={2}
              placeholder="Descripción"
              value={col.description}
              onChange={(e) => setCol({ ...col, description: e.target.value })}
            />

            {/* IMAGEN HERO: subir a Cloudinary o pegar URL */}
            <div>
              <label className="label">Imagen hero</label>
              <div className="flex gap-3">
                <div className="w-24 h-28 bg-sand overflow-hidden shrink-0 border border-line flex items-center justify-center">
                  {col.heroImage ? (
                    <img src={col.heroImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-stone text-center px-1">Sin imagen</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="btn-ghost py-2.5 w-full text-center cursor-pointer block">
                    {uploading ? 'Subiendo…' : '📷 Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onHeroFile(e.target.files?.[0])}
                    />
                  </label>
                  <input
                    className="field"
                    placeholder="…o pega una URL"
                    value={col.heroImage}
                    onChange={(e) => setCol({ ...col, heroImage: e.target.value })}
                  />
                  {col.heroImage && (
                    <button
                      onClick={() => setCol({ ...col, heroImage: '' })}
                      className="text-[11px] text-stone hover:text-red-700"
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <div className="flex gap-3">
              <button onClick={submitCollection} disabled={saving || uploading || !col.name.trim()} className="btn flex-1">
                {saving ? 'Guardando…' : col.id ? 'Guardar cambios' : 'Crear colección'}
              </button>
              {col.id && (
                <button onClick={() => setCol(EMPTY_COL)} className="btn-ghost">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
