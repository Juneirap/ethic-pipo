import { Context, Hono } from "hono";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import conMysql from "../ultis/connectDB";
import { eq } from "drizzle-orm";
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

    // อ่านข้อมูลไฟล์ที่อัปโหลด
    const body = await c.req.parseBody();
    const uploadedFile = body?.file as unknown as FileData;

    if (!uploadedFile || !uploadedFile.arrayBuffer) {
      return c.json({ error: "No valid file uploaded." }, 400);
    }

    const filePath = path.join(UPLOAD_DIR, uploadedFile.name);

    // อ่านข้อมูลไฟล์
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const fileContent = Buffer.from(arrayBuffer);

    // สร้าง MD5 Hash
    const md5Hash = crypto.createHash("md5").update(fileContent).digest("hex");

    // บันทึกไฟล์ลงในโฟลเดอร์
    await fs.writeFile(filePath, fileContent);

    // บันทึกข้อมูลไฟล์ในฐานข้อมูล
    const petitionId = parseInt(c.req.param("petitionId"));
    const documentTypeId = parseInt(c.req.param("documentTypeId"));

    await db.insert(petitionFiles).values({
      name: uploadedFile.name,
      extension: path.extname(uploadedFile.name),
      md5: md5Hash,
      petitionId,
      documentTypeId,
    });

    return c.json({ message: "File uploaded successfully!", filePath, md5Hash }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to upload file.", details: (error as Error).message }, 500);
  }
};

export const getFile = async (c: Context) => {
  try {
    const filename = c.req.param("filename");
    if (!filename) {
      return c.json({ error: "File name is required" }, 400);
    }

    // Decode the filename to handle special characters and spaces
    const decodedFilename = decodeURIComponent(filename);
    const sanitizedFilename = decodedFilename.replace(/[<>:"/\\|?*]/g, '_');
    
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return c.json({ error: "File not found" }, 404);
    }

    // Read file content as a Buffer
    const fileContent = await fs.readFile(filePath);
    
    // Detect file type for Content-Type
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = "application/octet-stream"; // Default for generic binary files

    switch (ext) {
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".doc":
        contentType = "application/msword";
        break;
      case ".docx":
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".txt":
        contentType = "text/plain; charset=UTF-8";
        break;
      case ".xlsx":
        contentType = 
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
      case ".xls":
        contentType = "application/vnd.ms-excel";
        break;
      case ".pptx":
        contentType = 
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        break;
      case ".ppt":
        contentType = "application/vnd.ms-powerpoint";
        break;
    }

    // Encode the filename for Content-Disposition header
    const encodedFilename = encodeURIComponent(decodedFilename)
      .replace(/['()]/g, escape) // Handle special characters
      .replace(/\*/g, '%2A')
      .replace(/%20/g, ' ');

    // Create a Blob from the buffer and return it as a response
    const blob = new Blob([fileContent], { type: contentType });
    return new Response(blob, {
      headers: {
        "Content-Type": `${contentType}; charset=UTF-8`,
        "Content-Disposition": `inline; filename*=UTF-8''${encodedFilename}`,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff"
      },
    });
  } catch (error) {
    console.error(error);
    return c.json({ 
      error: "Failed to get file.", 
      details: (error as Error).message 
    }, 500);
  }
};

// สร้างฟังก์ชันสําหรับการแก้ไขไฟล์
export const editFile = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const fileId = parseInt(c.req.param("id"));

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    // อ่านข้อมูลไฟล์
    const buffer = await file.arrayBuffer();
    const fileContent = Buffer.from(buffer);

    // สร้าง MD5 hash
    const md5Hash = crypto.createHash("md5").update(fileContent).digest("hex");

    // แยกนามสกุลไฟล์
    const extension = path.extname(file.name);
    const fileName = file.name;

    // ใช้ UPLOAD_DIR แทนการใช้ process.cwd()
    await ensureUploadDir();

    // บันทึกไฟล์
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), fileContent);

    // อัพเดทข้อมูลในฐานข้อมูล
    await db
      .update(petitionFiles)
      .set({
        name: fileName,
        extension,
        md5: md5Hash,
      })
      .where(eq(petitionFiles.id, fileId));

    // ดึงข้อมูลไฟล์ที่อัพเดทแล้ว
    const [updatedFile] = await db
      .select()
      .from(petitionFiles)
      .where(eq(petitionFiles.id, fileId));

    return c.json({ 
      message: "File edited successfully!",
      file: updatedFile
    }, 200);
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
      return c.json({ 
        error: "Missing required parameters", 
        message: "กรุณาระบุข้อมูลให้ครบถ้วน" 
      }, 400);
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
      return c.json({ 
        error: "Duplicate file", 
        message: `ไฟล์ ${filename} สำหรับเอกสารประเภทนี้มีอยู่แล้ว` 
      }, 409); // 409 Conflict
    }

    return c.json({ 
      message: "File can be uploaded",
      exists: false 
    }, 200);
  } catch (error) {
    console.error("Error checking file:", error);
    return c.json({ 
      error: "Server error", 
      message: "เกิดข้อผิดพลาดในการตรวจสอบไฟล์" 
    }, 500);
  }
};