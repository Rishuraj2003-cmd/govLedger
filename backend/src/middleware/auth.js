import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "development-secret");
    const user = await User.findById(payload.userId).select("-passwordHash -verificationOtp -resetOtp");

    if (!user) {
      response.status(401).json({ error: "User not found" });
      return;
    }

    request.user = user;
    next();
  } catch (_error) {
    response.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireRoles(...roles) {
  return (request, response, next) => {

    const userRole = request.user?.role?.toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());

    if (!request.user || !allowedRoles.includes(userRole)) {
      return response.status(403).json({ error: "You do not have permission for this action" });
    }

    next();
  };
}
