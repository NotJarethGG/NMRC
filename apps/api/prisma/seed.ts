import { PrismaClient, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

async function main() {
  console.log('Sembrando datos de GosthShop...');

  // --- Usuarios ---
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gosthshop.com' },
    update: {},
    create: { name: 'Admin GosthShop', email: 'admin@gosthshop.com', passwordHash, role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'staff@gosthshop.com' },
    update: {},
    create: { name: 'Staff GosthShop', email: 'staff@gosthshop.com', passwordHash, role: 'STAFF' },
  });
  await prisma.user.upsert({
    where: { email: 'cliente@gosthshop.com' },
    update: {},
    create: {
      name: 'Cliente Demo',
      email: 'cliente@gosthshop.com',
      passwordHash,
      role: 'CUSTOMER',
      phone: '8888-8888',
      address: 'San José, Costa Rica',
    },
  });

  // --- Categorías ---
  const categoryNames = ['Outerwear', 'Knitwear', 'Tees', 'Pants', 'Accessories'];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const c = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categories[name] = c.id;
  }

  // --- Colecciones ---
  const eighth = await prisma.collection.upsert({
    where: { slug: 'eternal' },
    update: {},
    create: {
      name: 'Eternal',
      slug: 'eternal',
      description: 'Una meditación sobre la silueta y el silencio. Prendas atemporales en tonos tierra.',
      heroImage:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
    },
  });
  const essentials = await prisma.collection.upsert({
    where: { slug: 'essentials' },
    update: {},
    create: {
      name: 'Essentials',
      slug: 'essentials',
      description: 'Los fundamentos del guardarropa GosthShop. Construcción elevada, uso diario.',
      heroImage:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    },
  });

  // --- Productos ---
  type Seed = {
    name: string;
    category: string;
    collectionId?: string;
    price: number; // colones
    featured?: boolean;
    description: string;
    images: string[];
  };

  const products: Seed[] = [
    {
      name: 'Overcoat de Lana Greige',
      category: 'Outerwear',
      collectionId: eighth.id,
      price: 285000,
      featured: true,
      description:
        'Abrigo largo de lana virgen con caída fluida y hombros relajados. Forro interior de cupro. Una pieza de declaración silenciosa.',
      images: [
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      name: 'Suéter Oversize Hueso',
      category: 'Knitwear',
      collectionId: eighth.id,
      price: 124000,
      featured: true,
      description:
        'Tejido grueso de mezcla de lana y alpaca. Cuello redondo amplio y puños acanalados. Calidez sin peso.',
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      name: 'Camiseta Boxy Algodón Pesado',
      category: 'Tees',
      collectionId: essentials.id,
      price: 42000,
      featured: true,
      description:
        'Algodón de 240gsm con caída estructurada. Corte boxy, costuras reforzadas. El básico definitivo.',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      name: 'Pantalón Sastre Taupe',
      category: 'Pants',
      collectionId: eighth.id,
      price: 98000,
      description:
        'Pantalón de pinzas con caída amplia y bajo sin rematar. Lana fría transpirable. Elegancia desestructurada.',
      images: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      name: 'Hoodie Pesado Carbón',
      category: 'Knitwear',
      collectionId: essentials.id,
      price: 78000,
      featured: true,
      description:
        'French terry de 480gsm. Capucha de doble capa, bolsillo canguro oculto. Comodidad de lujo.',
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      name: 'Bufanda de Lana Arena',
      category: 'Accessories',
      collectionId: eighth.id,
      price: 36000,
      description:
        'Bufanda extra larga tejida en telar manual. Lana merino suave al tacto. Tonalidad arena cálida.',
      images: [
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      name: 'Camisa Relaxed Crema',
      category: 'Outerwear',
      collectionId: essentials.id,
      price: 68000,
      description:
        'Camisa sobredimensionada de popelina de algodón. Botones de corozo, cuello suave. Versátil y refinada.',
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    {
      name: 'Pantalón Cargo Relajado Olivo',
      category: 'Pants',
      collectionId: essentials.id,
      price: 86000,
      description:
        'Cargo de sarga lavada con bolsillos utilitarios y cintura ajustable. Silueta amplia y moderna.',
      images: [
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  ];

  for (const p of products) {
    const slug = slugify(p.name);
    // Limpiar producto previo para reseed idempotente
    await prisma.product.deleteMany({ where: { slug } });
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        priceCents: p.price * 100,
        status: ProductStatus.ACTIVE,
        featured: p.featured ?? false,
        categoryId: categories[p.category],
        collectionId: p.collectionId ?? null,
        images: { create: p.images.map((url, i) => ({ url, position: i })) },
        variants: {
          create: SIZES.map((size) => ({
            size,
            stock: Math.floor(Math.random() * 12) + 2,
          })),
        },
      },
    });
  }

  console.log('Listo. Usuarios demo (password: password123):');
  console.log('  admin@gosthshop.com  (ADMIN)');
  console.log('  staff@gosthshop.com  (STAFF)');
  console.log('  cliente@gosthshop.com (CUSTOMER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
