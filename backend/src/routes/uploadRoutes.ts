import { Hono } from 'hono';
import { uploadFile ,getFile} from '../controllers/uploadController';

const app = new Hono();

// เส้นทางสำหรับอัปโหลดไฟล์
app.post('/upload/:petitionId/:documentTypeId', uploadFile);

// เส้นทางสำหรับดาวน์โหลดไฟล์
app.get('/file/:filename', getFile);

export default app;
