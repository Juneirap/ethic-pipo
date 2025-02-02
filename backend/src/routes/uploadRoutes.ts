import { Hono } from 'hono';
import { uploadFile, getFile, editFile, checkFile,unlinkFile } from '../controllers/uploadController';

const app = new Hono();

// เส้นทางสำหรับอัปโหลดไฟล์
app.post('/upload/:petitionId/:documentTypeId', uploadFile);

// เส้นทางสำหรับดาวน์โหลดไฟล์
app.get('/file/:md5', getFile);

// เส้นทางสำหรับการแก้ไขไฟล์
app.put('/edit/:id', editFile);

// เส้นทางสำหรับตรวจสอบไฟล์ซ้ำ
app.get('/check/:petitionId/:documentTypeId/:filename', checkFile);

// เส้นทางสำหรับลบไฟล์
app.delete('/unlink/:md5filename', unlinkFile);

export default app;
