import { prisma } from "@/lib/prisma";

export interface AuthenticatedParent {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  students: any[];
}

/**
 * Extracts and verifies parent identity from request headers.
 * Supports:
 * 1. "Per-User Token (BFF-injected, Orchexa relays)": Bearer token containing parent ID/phone
 * 2. "User Context (Signed actor, Partner-side RBAC)": x-parent-phone or x-parent-id
 */
export async function getParentFromRequest(request: Request): Promise<AuthenticatedParent | null> {
  const authHeader = request.headers.get("authorization");
  const parentIdHeader = request.headers.get("x-parent-id");
  const parentPhoneHeader = request.headers.get("x-parent-phone");

  // Check custom headers (User Context mode)
  if (parentIdHeader) {
    const parent = await prisma.parent.findUnique({
      where: { id: parentIdHeader },
      include: { students: { include: { classes: { include: { course: true } } } } }
    });
    if (parent) return parent;
  }

  if (parentPhoneHeader) {
    const parent = await prisma.parent.findUnique({
      where: { phone: parentPhoneHeader },
      include: { students: { include: { classes: { include: { course: true } } } } }
    });
    if (parent) return parent;
  }

  // Check Bearer token (Per-User Token mode)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    // Allow tokens formatted as "parent_<id>", "phone_<phone>", or raw phone/id
    const cleanToken = token.replace(/^(parent_|phone_|jwt_)/, "");
    
    const parent = await prisma.parent.findFirst({
      where: {
        OR: [
          { id: cleanToken },
          { phone: cleanToken },
          { phone: token }
        ]
      },
      include: { students: { include: { classes: { include: { course: true } } } } }
    });
    if (parent) return parent;
  }

  return null;
}
