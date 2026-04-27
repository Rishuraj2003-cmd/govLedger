import jwt from "jsonwebtoken";

export function signAuthToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || "development-secret",
    { expiresIn: "7d" },
  );
}
