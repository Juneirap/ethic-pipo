import conMysql from "../ultis/connectDB";
import { researcher, prename, department , faculty} from "../db/schema";
import { sql } from "drizzle-orm";

const db = await conMysql();

// Get all researchers
export const getAllResearchersWithPrenameDepartmentFaculty = async (c: any) => {
  try {
    const allResearchersWithPrenameDepartmentFaculty = await db
      .select(
        {
          id: researcher.id,
          name: researcher.name,
          surname: researcher.surname,
          telNo: researcher.telNo,
          email: researcher.email,
          prename: prename.description,
          department: department.description,
          faculty: faculty.description,
        }
      )
      .from(researcher)
      .leftJoin(prename, sql`${researcher.prenameId} = ${prename.id}`)
      .leftJoin(department, sql`${researcher.departmentId} = ${department.id}`)
      .leftJoin(faculty, sql`${department.facultyId} = ${faculty.id}`);
    return c.json(allResearchersWithPrenameDepartmentFaculty, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve researchers.", details: (error as any).message },
      500
    );
  }
}

// Add new researcher
export const addResearcher = async (c: any) => {
  try {
    const { prenameId, name, surname, departmentId, telNo, email } = await c.req.json();

    if (!prenameId || !name || !surname || !departmentId || !telNo || !email) {
      return c.json({ error: "All fields are required." }, 400);
    }

    await db.insert(researcher).values({
      prenameId,
      name,
      surname,
      departmentId,
      telNo,
      email,
    });

    return c.json({ message: "Researcher added successfully!" }, 201);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to add researcher.", details: (error as any).message },
      500
    );
  }
};

export const getResearcherById = async (c: any) => {
    try {
      const researcherId = c.req.query("id"); // รับค่า id จาก query parameter
      if (!researcherId) {
        return c.json({ error: "Researcher ID is required." }, 400);
      }
  
      const researcherData = await db.select().from(researcher).where({ id: researcherId }).limit(1);
  
      if (!researcherData.length) {
        return c.json({ error: "Researcher not found." }, 404);
      }
  
      return c.json(researcherData[0], 200); // ส่งคืนข้อมูล researcher เดียว
    } catch (error) {
      console.error(error);
      return c.json(
        { error: "Failed to retrieve researcher.", details: (error as any).message },
        500
      );
    }
  };


  export const getResearchersByName = async (c: any) => {
    try {
      const name = c.req.query("name");
      if (!name) {
        return c.json({ error: "Name is required." }, 400);
      }
  
      const researchers = await db
        .select({
          id: researcher.id,
          prenameId: researcher.prenameId,
          name: researcher.name,
          surname: researcher.surname,
          telNo: researcher.telNo,
          email: researcher.email,
          department: department.description, 
          faculty: faculty.description
        })
        .from(researcher)
        .leftJoin(prename, sql`${researcher.prenameId} = ${prename.id}`)
        .leftJoin(department, sql`${researcher.departmentId} = ${department.id}`)
        .leftJoin(faculty, sql`${department.facultyId} = ${faculty.id}`)
        .where(sql`${researcher.name} LIKE ${'%' + name + '%'}`)
        .limit(10);
  
      if (researchers.length === 0) {
        return c.json({ message: "No researchers found." }, 404);
      }
  
      return c.json(researchers, 200);
    } catch (error) {
      console.error(error);
      return c.json(
        { error: "Failed to retrieve researchers.", details: (error as any).message },
        500
      );
    }
  };

export const deleteResearcher = async (c: any) => {
  try {
    const researcherId = c.req.query("id"); // รับค่า id จาก query parameter
    if (!researcherId) {
      return c.json({ error: "Researcher ID is required." }, 400);
    }
    await db.delete(researcher).where({ id: researcherId });
    return c.json({ message: "Researcher deleted successfully!" }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to delete researcher.", details: (error as any).message },
      500
    );
  }
};  

export const getlatestResearcher = async (c: any) => {
  try {
    const latestResearcher = await db
      .select()
      .from(researcher)
      .orderBy(sql`${researcher.id} DESC`)
      .limit(1);

    if(!latestResearcher.length) {
      return c.json({ error: "No researchers found." }, 404);
    }

    return c.json(latestResearcher[0], 200);
  } catch (error) {
    console.error(error);    
    return c.json(
      { error: "Failed to retrieve researcher.", details: (error as any).message },
      500
    );
  }
};

export const verifyResearcherByPhone = async (c: any) => {
  try {
    // รับค่าเบอร์โทรจาก query parameter
    const telNo = c.req.query("telNo");

    // ตรวจสอบว่ามีการส่งเบอร์โทรหรือไม่
    if (!telNo) {
      return c.json({ error: "Phone number is required." }, 400);
    }

    // ค้นหาข้อมูลในฐานข้อมูลโดยใช้เบอร์โทร
    const researcherData = await db
      .select({
        id: researcher.id,
        name: researcher.name,
        telNo: researcher.telNo,
      })
      .from(researcher)
      .where(sql`${researcher.telNo} = ${telNo}`)
      .limit(1);

    // หากไม่พบข้อมูลในฐานข้อมูล
    if (!researcherData.length) {
      return c.json({ error: "Phone number not found." }, 404);
    }

    // ส่งผลลัพธ์กลับหากการตรวจสอบสำเร็จ
    return c.json(
      { message: "Verification successful!", data: researcherData[0] },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to verify phone number.", details: (error as any).message },
      500
    );
  }
};

