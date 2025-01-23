// +page.server.js
export async function load({ cookies }) {
    // ดึงค่า auth_token จากคุกกี้
    const authToken = cookies.get('auth_token') || null;
  
    // ส่งค่า authToken ไปให้หน้าเพจ
    return {
      authToken
    };
  }
  