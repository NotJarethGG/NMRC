import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, formatCRC } from '../lib/api';
import { useAdminProducts } from '../hooks/useAdmin';
import { ProductEditor } from '../components/ProductEditor';
import type { Product, ProductStatus } from '../lib/types';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-ink text-bone',
  DRAFT: 'bg-sand text-stone',
  ARCHIVED: 'bg-line text-stone',
};

// Ciclo al tocar el estado
const NEXT_STATUS: Record<ProductStatus, ProductStatus> = {
  ACTIVE: 'DRAFT',
  DRAFT: 'ARCHIVED',
  ARCHIVED: 'ACTIVE',
};

const PAGE_SIZE = 8;

export function Products() {
  const { data: products, isLoading } = useAdminProducts();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const totalStock = (p: Product) => p.variants.reduce((n, v) => n + v.stock, 0);

  const total = products?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => (products ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [products, safePage],
  );
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  const remove = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    await api.delete(`/products/${p.id}`);
    qc.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const cycleStatus = async (p: Product) => {
    const next = NEXT_STATUS[p.status];
    setTogglingId(p.id);
    try {
      await api.patch(`/products/${p.id}`, { status: next });
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      await qc.invalidateQueries({ queryKey: ['stats'] });
    } finally {
      setTogglingId(null);
    }
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
            {pageItems.map((p) => (
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
                  <button
                    onClick={() => cycleStatus(p)}
                    disabled={togglingId === p.id}
                    title="Toca para cambiar el estado"
                    className={`badge ${STATUS_BADGE[p.status]} transition-opacity hover:opacity-80 disabled:opacity-40`}
                  >
                    {togglingId === p.id ? '…' : p.status}
                  </button>
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

        {/* PAGINACIÓN */}
        {total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-line text-xs">
            <span className="text-stone uppercase tracking-wide">
              {from}–{to} de {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 border border-line uppercase tracking-wide hover:border-ink disabled:opacity-30 disabled:hover:border-line"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 border ${
                    safePage === i + 1 ? 'bg-ink text-bone border-ink' : 'border-line hover:border-ink'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 border border-line uppercase tracking-wide hover:border-ink disabled:opacity-30 disabled:hover:border-line"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
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
