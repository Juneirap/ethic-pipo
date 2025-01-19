import { Hono } from 'hono';
import { uploadFile ,getFile,editFile} from '../controllers/uploadController';

const app = new Hono();

// เส้นทางสำหรับอัปโหลดไฟล์
app.post('/upload/:petitionId/:documentTypeId', uploadFile);

// เส้นทางสำหรับดาวน์โหลดไฟล์
app.get('/file/:filename', getFile);

// เส้นทางสำหรับการแก้ไขไฟล์
app.put('/edit/:id', editFile);

export default app;
