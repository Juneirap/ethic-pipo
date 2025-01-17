import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import conMysql from "../ultis/connectDB";
import {
  staff,
  researcher,
  committee,
  roles,
  prename,
  department,
  faculty,
  committeePosition,
} from "../db/schema";
import { sql } from "drizzle-orm";

// จัดเก็บ active sessions
const activeSessions: Map<string, { id: number; role: string; name: string }> =
  new Map();

// เชื่อมต่อกับฐานข้อมูล
const db = await conMysql();

// เช็กว่า JWT_SECRET ถูกกำหนดใน environment หรือไม่
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

// ฟังก์ชันสำหรับการเข้าสู่ระบบ
export const login = async (c: any) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) {
      return c.json({ error: "Username and password are required." }, 400);
    }

    /////////////////////////////////////use telNo as password and username

    // ค้นหาข้อมูลจากตาราง staff
    const staffResult = await db
      .select({
        id: staff.id,
        prename_des: sql<string>`''`.as("prename_des"),
        name: staff.name,
        surname: staff.surname,
        type: sql<string>`'staff'`.as("type"),
        password: staff.telNo,
      })
      .from(staff)
      .where(sql`${staff.telNo} = ${username}`)
      .limit(1);

    // ค้นหาข้อมูลจากตาราง researcher
    // const researcherResult = await db
    //   .select({
    //     id: researcher.id,
    //     prename_des: prename.description,
    //     name: researcher.name,
    //     surname: researcher.surname,
    //     type: sql<string>`'researcher'`.as('type'),
    //     password: researcher.telNo
    //   })
    //   .from(researcher)
    //   .leftJoin(prename, sql`${researcher.prenameId} = ${prename.id}`)
    //   .where(sql`${researcher.telNo} = ${username}`)
    //   .limit(1);

    // ค้นหาข้อมูลจากตาราง committee
    const committeeResult = await db
      .select({
        id: committee.id,
        prename_des: prename.description,
        name: committee.name,
        surname: committee.surname,
        type: sql<string>`'committee'`.as("type"),
        password: committee.telNo,
      })
      .from(committee)
      .leftJoin(prename, sql`${committee.prenameId} = ${prename.id}`)
      .where(sql`${committee.telNo} = ${username}`)
      .limit(1);

    // รวมผลลัพธ์ทั้งหมด
    // const user = [...staffResult, ...researcherResult, ...committeeResult][0];
    const user = [...staffResult, ...committeeResult][0];

    if (!user) {
      return c.json({ error: "User not found." }, 401);
    }

    // ตรวจสอบรหัสผ่าน
    if (user.password !== password) {
      return c.json({ error: "Invalid password." }, 401);
    }

    // สร้าง payload สำหรับ JWT
    const payload = {
      id: user.id,
      prename_des: user.prename_des ?? "",
      name: user.name,
      surname: user.surname,
      type: user.type,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // หมดอายุใน 24 ชั่วโมง
    };

    // สร้าง JWT token
    const token = await sign(payload, jwtSecret);

    // เก็บ session
    activeSessions.set(token, {
      id: user.id,
      role: user.type,
      name: `${user.prename_des}${user.name} ${user.surname}`,
    });

    // ตั้งค่า cookie
    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 24 * 60 * 60, // หมดอายุใน 24 ชั่วโมง
    });

    return c.json({
      message: "Login successful",
      token,
      user: payload,
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      { success: false, error: "An error occurred during login." },
      500
    );
  }
};

// ฟังก์ชันสำหรับการออกจากระบบ
export const logout = async (c: any) => {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];

    if (token) {
      // ลบ session
      activeSessions.delete(token);
    }

    // ลบคุกกี้
    setCookie(c, "auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",      // เส้นทางต้องตรงกับตอนตั้งค่า
      maxAge: 0,      // หมดอายุทันที
    });

    return c.json({ success: true, message: "Logout successful" });
  } catch (error) {
    return c.json({ success: false, message: "Logout failed" }, 500);
  }
};

// ฟังก์ชันสำหรับตรวจสอบสถานะการล็อกอิน
export const getActiveSessions = async (c: any) => {
  const sessions = Array.from(activeSessions.values());
  return c.json({ activeSessions: sessions }, 200);
};

export const getAuth = async (c: any) => {
  const authToken = c.req.cookie("auth_token");
  if (!authToken) {
    return c.json({ success: false, message: "No auth token" }, 401);
  }

  return c.json({ success: true, authToken });
};
