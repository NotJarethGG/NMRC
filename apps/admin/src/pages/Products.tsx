import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, formatCRC } from '../lib/api';
import { useAdminProducts } from '../hooks/useAdmin';
import { ProductEditor } from '../components/ProductEditor';
import type { Product } from '../lib/types';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-ink text-bone',
  DRAFT: 'bg-sand text-stone',
  ARCHIVED: 'bg-line text-stone',
};

export function Products() {
  const { data: products, isLoading } = useAdminProducts();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const totalStock = (p: Product) => p.variants.reduce((n, v) => n + v.stock, 0);

  const remove = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    await api.delete(`/products/${p.id}`);
    qc.invalidateQueries({ queryKey: ['admin-products'] });
  };

  return (
    <div>
      <header className="flex items-end justify-between mb-8">
        <div>
          <span className="eyebrow">Inventario</span>
          <h1 className="font-display text-4xl mt-1">Productos</h1>
        </div>
        <button onClick={() => setCreating(true)} className="btn py-3">
          + Nuevo producto
        </button>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone text-[11px] uppercase tracking-wide border-b border-line">
              <th className="px-6 py-3 font-normal">Producto</th>
              <th className="px-6 py-3 font-normal">Categoría</th>
              <th className="px-6 py-3 font-normal">Precio</th>
              <th className="px-6 py-3 font-normal">Stock</th>
              <th className="px-6 py-3 font-normal">Estado</th>
              <th className="px-6 py-3 font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-stone">
                  Cargando…
                </td>
              </tr>
            )}
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-sand overflow-hidden shrink-0">
                      {p.images[0] && (
                        <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {p.featured && <span className="text-[10px] text-stone uppercase">Destacado</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-stone">{p.category?.name}</td>
                <td className="px-6 py-3">{formatCRC(p.priceCents)}</td>
                <td className="px-6 py-3">
                  <span className={totalStock(p) === 0 ? 'text-red-700' : ''}>{totalStock(p)} uds</span>
                </td>
                <td className="px-6 py-3">
                  <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-6 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-ink hover:underline text-xs mr-4"
                  >
                    Editar
                  </button>
                  <button onClick={() => remove(p)} className="text-red-700 hover:underline text-xs">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {products && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-stone">
                  No hay productos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductEditor
          product={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}
