import { auth } from "@/lib/auth";
import jwt from "jsonwebtoken";

export interface AdminInfo {
  isAdmin: boolean;
  userId?: string;
}

export async function getAdminFromRequest(
  req?: Request
): Promise<AdminInfo> {
  // Check NextAuth session first
  const session = await auth();
  if (session?.user?.isAdmin === 1) {
    return { isAdmin: true, userId: session.user.id };
  }

  // Fall back to admin JWT in Authorization header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const secret =
        process.env.ADMIN_JWT_SECRET || process.env.AUTH_SECRET;
      if (secret) {
        try {
          const decoded = jwt.verify(token, secret) as {
            username: string;
            role: string;
          };
          if (decoded.role === "admin" && decoded.username) {
            return { isAdmin: true };
          }
        } catch {
          // Invalid token, fall through
        }
      }
    }
  }

  return { isAdmin: false };
}
