import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, fromCRC } from '../lib/api';
import { useCategories, useCollections, uploadImage } from '../hooks/useAdmin';
import type { Product, ProductStatus } from '../lib/types';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface Props {
  product: Product | null; // null = nuevo
  onClose: () => void;
}

interface VariantRow {
  size: string;
  stock: number;
}

export function ProductEditor({ product, onClose }: Props) {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { data: collections } = useCollections();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [priceColones, setPriceColones] = useState<number>(0);
  const [categoryId, setCategoryId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [featured, setFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>(
    DEFAULT_SIZES.map((size) => ({ size, stock: 0 })),
  );
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setNameEn(product.nameEn ?? '');
      setDescription(product.description ?? '');
      setDescriptionEn(product.descriptionEn ?? '');
      setPriceColones(product.priceCents / 100);
      setCategoryId(product.categoryId);
      setCollectionId(product.collectionId ?? '');
      setStatus(product.status);
      setFeatured(product.featured);
      setVariants(
        product.variants.length
          ? product.variants.map((v) => ({ size: v.size, stock: v.stock }))
          : DEFAULT_SIZES.map((size) => ({ size, stock: 0 })),
      );
      setImages(product.images.map((i) => i.url));
    }
  }, [product]);

  useEffect(() => {
    if (!product && categories?.length && !categoryId) setCategoryId(categories[0].id);
  }, [categories, product, categoryId]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadImage(file));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError('No se pudo subir una imagen.');
    } finally {
      setUploading(false);
    }
  };

  const setStock = (size: string, stock: number) =>
    setVariants((prev) => prev.map((v) => (v.size === size ? { ...v, stock } : v)));

  const save = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      name,
      nameEn: nameEn.trim() || null,
      description,
      descriptionEn: descriptionEn.trim() || null,
      priceCents: fromCRC(priceColones),
      categoryId,
      collectionId: collectionId || null,
      status,
      featured,
      variants: variants.filter((v) => v.size.trim()),
      images: images.map((url, i) => ({ url, position: i })),
    };
    try {
      if (product) await api.patch(`/products/${product.id}`, payload);
      else await api.post('/products', payload);
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-bone h-full overflow-y-auto">
        <div className="sticky top-0 bg-bone/95 backdrop-blur px-8 h-16 flex items-center justify-between border-b border-line z-10">
          <h2 className="font-display text-2xl">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="text-stone hover:text-ink text-sm">
            Cerrar ✕
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="label">Nombre (español)</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="label">Descripción (español)</label>
            <textarea
              rows={3}
              className="field resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* INGLÉS (INTERNACIONAL) */}
          <div className="rounded border border-line bg-paper/60 p-4 space-y-4">
            <p className="text-[11px] uppercase tracking-wide text-stone">
              Inglés · internacional <span className="text-stone/60">(opcional — si se deja vacío se muestra el español)</span>
            </p>
            <div>
              <label className="label">Name (English)</label>
              <input
                className="field"
                placeholder={name || 'e.g. NMRC Hoodie — No Mercy'}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Description (English)</label>
              <textarea
                rows={3}
                className="field resize-none"
                placeholder="Heavyweight cotton hoodie…"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Precio (₡)</label>
              <input
                type="number"
                className="field"
                value={priceColones}
                onChange={(e) => setPriceColones(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                className="field"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
              >
                <option value="ACTIVE">Activo (visible)</option>
                <option value="DRAFT">Borrador</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoría</label>
              <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Colección</label>
              <select
                className="field"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
              >
                <option value="">— Sin colección —</option>
                {collections?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Destacado en la página principal
          </label>

          {/* TALLAS / STOCK */}
          <div>
            <label className="label">Inventario por talla</label>
            <div className="space-y-2">
              {variants.map((v) => (
                <div key={v.size} className="flex items-center gap-3">
                  <input
                    className="field w-20 text-center"
                    value={v.size}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((x) => (x.size === v.size ? { ...x, size: e.target.value } : x)),
                      )
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    className="field flex-1"
                    value={v.stock}
                    onChange={(e) => setStock(v.size, Number(e.target.value))}
                  />
                  <button
                    className="text-stone hover:text-red-700 text-sm px-2"
                    onClick={() => setVariants((prev) => prev.filter((x) => x.size !== v.size))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              className="btn-ghost mt-3 text-[11px] py-1.5"
              onClick={() => setVariants((prev) => [...prev, { size: '', stock: 0 }])}
            >
              + Añadir talla
            </button>
          </div>

          {/* IMÁGENES */}
          <div>
            <label className="label">Imágenes</label>
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={url + i} className="relative w-20 h-24 bg-sand overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-ink/70 text-bone w-5 h-5 text-xs opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="w-20 h-24 border border-dashed border-line flex items-center justify-center cursor-pointer text-stone text-xs text-center hover:border-ink">
                {uploading ? '…' : '+ Subir'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            </div>
            <p className="text-[11px] text-stone mt-2">
              También puedes pegar URLs de imagen abajo.
            </p>
            <input
              className="field mt-2"
              placeholder="https://… (Enter para añadir)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) setImages((prev) => [...prev, v]);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-bone/95 backdrop-blur px-8 py-4 border-t border-line flex gap-3">
          <button onClick={save} disabled={saving || !name} className="btn flex-1 py-3">
            {saving ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button onClick={onClose} className="btn-ghost py-3">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
