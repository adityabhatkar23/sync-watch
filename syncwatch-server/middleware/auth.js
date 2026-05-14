import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function socketAuthMiddleware(socket, next) {
  const cookieHeader = socket.handshake.headers.cookie || "";
  const token = parseCookie(cookieHeader, "token");

  if (!token) {
    return next(new Error("Not authenticated"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; 
    next();
  } catch {
    return next(new Error("Invalid or expired token"));
  }
}

function parseCookie(cookieStr, name) {
  const match = cookieStr
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}