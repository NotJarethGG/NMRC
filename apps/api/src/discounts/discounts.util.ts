import { PrismaService } from '../prisma/prisma.service';

// Devuelve el código si es usable (activo, no vencido, con usos disponibles)
export async function findValidDiscount(prisma: PrismaService, rawCode: string) {
  const code = rawCode.toUpperCase().trim();
  const found = await prisma.discountCode.findUnique({ where: { code } });
  if (!found || !found.active) return null;
  if (found.expiresAt && found.expiresAt < new Date()) return null;
  if (found.maxUses != null && found.uses >= found.maxUses) return null;
  return found;
}
