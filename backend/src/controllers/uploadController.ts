import { Context, Hono } from "hono";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import conMysql from "../ultis/connectDB";
import { eq, and } from "drizzle-orm";
import { petitionFiles } from "../db/schema";

const db = await conMysql();
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// ตรวจสอบและสร้างโฟลเดอร์ uploads ถ้ายังไม่มี
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create uploads directory:", error);
    throw new Error("Failed to create uploads directory");
  }
}

interface FileData {
  name: string;
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export const uploadFile = async (c: Context) => {
  try {
    await ensureUploadDir(); // ตรวจสอบและสร้างโฟลเดอร์ uploads

    // รับค่าพารามิเตอร์จาก URL
    const petitionId = parseInt(c.req.param("petitionId"));
    const documentTypeId = parseInt(c.req.param("documentTypeId"));

    // อ่านข้อมูลไฟล์ที่อัปโหลด
    const body = await c.req.parseBody();
    const uploadedFile = body?.file as unknown as FileData;

    if (!uploadedFile || !uploadedFile.arrayBuffer) {
      return c.json({ error: "No valid file uploaded." }, 400);
    }

    // ดึงชื่อไฟล์โดยไม่มีนามสกุล
    const fileExtension = path.extname(uploadedFile.name); // นามสกุลไฟล์
    const fileNameWithoutExt = path.basename(uploadedFile.name, fileExtension); // ชื่อไฟล์โดยไม่มีนามสกุล

    // สร้าง MD5 Hash ใช้เป็นชื่อไฟล์ที่เก็บในโฟลเดอร์
    const md5Hash = crypto
      .createHash("md5")
      .update(petitionId + "." + fileNameWithoutExt)
      .digest("hex");

    const filePath = path.join(UPLOAD_DIR, md5Hash);

    // อ่านข้อมูลไฟล์
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const fileContent = Buffer.from(arrayBuffer);

    // บันทึกไฟล์ลงในโฟลเดอร์
    await fs.writeFile(filePath, fileContent);

    // บันทึกข้อมูลไฟล์ลงในฐานข้อมูล
    await db.insert(petitionFiles).values({
      name: fileNameWithoutExt,
      extension: fileExtension,
      md5: md5Hash,
      petitionId,
      documentTypeId,
    });

    return c.json(
      { message: "File uploaded successfully!", filePath, md5Hash },
      201
    );
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to upload file.", details: (error as Error).message },
      500
    );
  }
};

export const getFile = async (c: Context) => {
  try {
    const md5 = c.req.param("md5"); // รับค่า MD5 จาก URL
    if (!md5) {
      return c.json({ error: "MD5 hash is required" }, 400);
    }

    // ค้นหาไฟล์จากฐานข้อมูลโดยใช้ MD5
    const fileRecord = await db
      .select()
      .from(petitionFiles)
      .where(eq(petitionFiles.md5, md5))
      .limit(1);

    if (!fileRecord.length) {
      return c.json({ error: "File not found in database" }, 404);
    }

    const fileData = fileRecord[0]; // ข้อมูลไฟล์จากฐานข้อมูล
    const filePath = path.join(UPLOAD_DIR, md5); // ใช้ MD5 เป็นชื่อไฟล์

    // ตรวจสอบว่าไฟล์มีอยู่จริงบนเซิร์ฟเวอร์
    try {
      await fs.access(filePath);
    } catch (error) {
      return c.json({ error: "File not found on server" }, 404);
    }

    // อ่านข้อมูลไฟล์
    const fileContent = await fs.readFile(filePath);

    // กำหนด MIME type ตามนามสกุลไฟล์
    const contentType = getMimeType(fileData.extension);

    // ตั้งค่าให้ดาวน์โหลดไฟล์
    return new Response(fileContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          fileData.name + fileData.extension
        )}"`,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to get file.", details: (error as Error).message },
      500
    );
  }
};

// ฟังก์ชันสำหรับตรวจสอบ MIME type
const getMimeType = (extension: string) => {
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain; charset=UTF-8",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
};

// สร้างฟังก์ชันสําหรับการแก้ไขไฟล์
export const editFile = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const fileId = parseInt(c.req.param("id"));
    const petitionId = parseInt(c.req.param("petitionId"));

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    // อ่านข้อมูลไฟล์
    const buffer = await file.arrayBuffer();
    const fileContent = Buffer.from(buffer);

    // แยกนามสกุลไฟล์
    const fileExtension = path.extname(file.name); // นามสกุลไฟล์
    const fileNameWithoutExt = path.basename(file.name, fileExtension); // ชื่อไฟล์โดยไม่มีนามสกุล

    // สร้าง MD5 hash
    const md5Hash = crypto
      .createHash("md5")
      .update(petitionId + "." + fileNameWithoutExt)
      .digest("hex");

    // ใช้ MD5 hash เป็นชื่อไฟล์ที่เก็บ
    const newFileName = `${md5Hash}`;

    await ensureUploadDir();

    // บันทึกไฟล์ใหม่
    await fs.writeFile(path.join(UPLOAD_DIR, newFileName), fileContent);

    // อัพเดทข้อมูลในฐานข้อมูล
    await db
      .update(petitionFiles)
      .set({
        name: fileNameWithoutExt,
        extension: fileExtension,
        md5: md5Hash,
      })
      .where(eq(petitionFiles.id, fileId));

    // ดึงข้อมูลไฟล์ที่อัพเดทแล้ว
    const [updatedFile] = await db
      .select()
      .from(petitionFiles)
      .where(eq(petitionFiles.id, fileId));

    return c.json(
      {
        message: "File edited successfully!",
        file: updatedFile,
      },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to edit file.", details: (error as any).message },
      500
    );
  }
};


export const checkFile = async (c: Context) => {
  try {
    const petitionId = parseInt(c.req.param("petitionId"));
    const documentTypeId = parseInt(c.req.param("documentTypeId"));
    const filename = c.req.param("filename");

    if (!petitionId || !documentTypeId || !filename) {
      return c.json(
        {
          error: "Missing required parameters",
          message: "กรุณาระบุข้อมูลให้ครบถ้วน",
        },
        400
      );
    }

    // ค้นหาไฟล์ในฐานข้อมูล
    const existingFiles = await db
      .select()
      .from(petitionFiles)
      .where(
        eq(petitionFiles.petitionId, petitionId) &&
          eq(petitionFiles.documentTypeId, documentTypeId) &&
          eq(petitionFiles.name, filename)
      );

    if (existingFiles.length > 0) {
      return c.json(
        {
          error: "Duplicate file",
          message: `ไฟล์ ${filename} สำหรับเอกสารประเภทนี้มีอยู่แล้ว`,
        },
        409
      ); // 409 Conflict
    }

    return c.json(
      {
        message: "File can be uploaded",
        exists: false,
      },
      200
    );
  } catch (error) {
    console.error("Error checking file:", error);
    return c.json(
      {
        error: "Server error",
        message: "เกิดข้อผิดพลาดในการตรวจสอบไฟล์",
      },
      500
    );
  }
};


    // สร้างฟังก์ชันสําหรับการลบไฟล์
    export const unlinkFile = async (c: Context) => {
      try {
        const md5 = c.req.param("md5filename"); // รับค่า MD5 จาก URL

        if (!md5) {
          return c.json({ error: "MD5 hash is required" }, 400);
        }

        // ตรวจสอบว่าไฟล์มีอยู่จริงบนเซิร์ฟเวอร์
        const filePath = path.join(UPLOAD_DIR, md5);
        try {
          await fs.access(filePath);
        } catch (error) {
          return c.json({ error: "File not found on server" }, 404);
        }

        // ลบไฟล์จริง
        await fs.unlink(filePath);

        // ลบข้อมูลในฐานข้อมูล
        await db.delete(petitionFiles).where(eq(petitionFiles.md5, md5));

        return c.json({ message: "File deleted successfully!" }, 200);
      } catch (error) {
        console.error(error);
        return c.json(
          { error: "Failed to delete file.", details: (error as any).message },
          500
        );
      }
    };
