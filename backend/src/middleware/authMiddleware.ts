import { verify } from "hono/jwt";
import { Context } from "hono";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined");
}

export const authMiddleware = async (c: Context, next: Function) => {
  try {
    // ดึง token จาก header
    const token = c.req.header("Authorization")?.split(" ")[1];
    
    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    // ตรวจสอบความถูกต้องของ token
    const payload = await verify(token, jwtSecret);
    
    // เก็บข้อมูล user ไว้ใน context
    c.set('user', payload);
    
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
};
