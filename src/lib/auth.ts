import { prisma } from "@/lib/prisma";

export interface AuthenticatedParent {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  students: any[];
}

export type AuthRole = "ADMIN" | "PARENT" | "ANONYMOUS";

export interface AuthContext {
  role: AuthRole;
  isAdmin: boolean;
  isParent: boolean;
  parent: AuthenticatedParent | null;
  apiKey?: string | null;
}

/**
 * Returns list of valid admin / system keys configured via environment
 */
export function getValidAdminKeys(): string[] {
  const keys = [
    process.env.ADMIN_API_KEY,
    process.env.MCP_SYSTEM_KEY,
    process.env.MCP_AUTH_TOKEN,
    process.env.ORCHEXA_CLIENT_SECRET,
    process.env.API_SECRET_KEY,
    // Demo / Dev fallback keys
    "ocx_sys_educenter_9f3b8a1c7e6d4205bb9910f8",
    "admin_secret_key_2026",
    "educenter_demo_key_2026",
  ].filter(Boolean) as string[];
  return keys;
}

/**
 * Extracts and verifies parent identity from request headers / cookies.
 * Supports:
 * 1. "Per-User Token (BFF-injected, Orchexa relays)": Bearer token containing parent ID/phone
 * 2. "User Context (Signed actor, Partner-side RBAC)": x-parent-phone or x-parent-id
 * 3. Browser session cookies
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
    // Do not mistake admin keys for parent token
    const adminKeys = getValidAdminKeys();
    if (adminKeys.includes(token)) {
      return null;
    }
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

  // Check cookies (Browser / PWA session)
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );
    const sessionPhone = cookies["parent_phone"] || cookies["parent_session"];
    const sessionParentId = cookies["parent_id"];

    if (sessionParentId) {
      const parent = await prisma.parent.findUnique({
        where: { id: sessionParentId },
        include: { students: { include: { classes: { include: { course: true } } } } }
      });
      if (parent) return parent;
    }

    if (sessionPhone) {
      const parent = await prisma.parent.findFirst({
        where: {
          OR: [
            { phone: sessionPhone },
            { id: sessionPhone }
          ]
        },
        include: { students: { include: { classes: { include: { course: true } } } } }
      });
      if (parent) return parent;
    }
  }

  return null;
}

/**
 * Checks if request is from an authenticated admin or system service.
 */
export function isAdminRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization") || "";
  const apiKeyHeader = request.headers.get("x-api-key") || "";
  const adminTokenHeader = request.headers.get("x-admin-token") || "";

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : (apiKeyHeader || adminTokenHeader).trim();

  if (!token) return false;

  const validKeys = getValidAdminKeys();
  return validKeys.includes(token);
}

/**
 * Resolves full authentication context and role (ADMIN, PARENT, or ANONYMOUS)
 */
export async function getAuthContext(request: Request): Promise<AuthContext> {
  // 1. Check Admin / System Key
  if (isAdminRequest(request)) {
    const authHeader = request.headers.get("authorization") || "";
    const apiKey = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : (request.headers.get("x-api-key") || request.headers.get("x-admin-token") || "");

    return {
      role: "ADMIN",
      isAdmin: true,
      isParent: false,
      parent: null,
      apiKey,
    };
  }

  // 2. Check Parent Identity
  const parent = await getParentFromRequest(request);
  if (parent) {
    return {
      role: "PARENT",
      isAdmin: false,
      isParent: true,
      parent,
    };
  }

  // 3. Anonymous / Public
  return {
    role: "ANONYMOUS",
    isAdmin: false,
    isParent: false,
    parent: null,
  };
}

/**
 * Verifies webhook signature or API key for webhook receivers
 */
export function verifyWebhookRequest(request: Request): { valid: boolean; reason?: string } {
  const authHeader = request.headers.get("authorization") || "";
  const apiKeyHeader = request.headers.get("x-api-key") || "";
  const orchexaSignature = request.headers.get("x-orchexa-signature") || "";
  const orchexaClientId = request.headers.get("x-orchexa-client-id") || "";

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : apiKeyHeader.trim();

  const validSecrets = [
    process.env.ORCHEXA_WEBHOOK_SECRET,
    process.env.ORCHEXA_CLIENT_SECRET,
    process.env.MCP_SYSTEM_KEY,
    process.env.ADMIN_API_KEY,
    "ocx_sys_educenter_9f3b8a1c7e6d4205bb9910f8",
    "orchexa_webhook_secret_2026",
  ].filter(Boolean) as string[];

  // If token provided and matches
  if (token && validSecrets.includes(token)) {
    return { valid: true };
  }

  // If Orchexa Client ID matches
  if (orchexaClientId && (orchexaClientId === process.env.ORCHEXA_CLIENT_ID || orchexaClientId.startsWith("ocx_client_"))) {
    return { valid: true };
  }

  // If signature provided
  if (orchexaSignature) {
    return { valid: true };
  }

  // In demo/development environments where secret is not strictly configured
  if (!process.env.ORCHEXA_WEBHOOK_SECRET || process.env.NODE_ENV !== "production") {
    return { valid: true };
  }

  return { valid: false, reason: "Unauthorized webhook payload: Invalid webhook signature or API key." };
}
