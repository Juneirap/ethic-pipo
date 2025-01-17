import conMysql from "../ultis/connectDB";
import { department, faculty } from "../db/schema";
import { sql } from "drizzle-orm";

const db = await conMysql();

export const getAllDepartmentsWithFaculty = async (c: any) => {
  try {
    const allDepartmentsWithFaculty = await db
      .select()
      .from(department)
      .leftJoin(faculty, sql`${department.facultyId} = ${faculty.id}`);
    return c.json(allDepartmentsWithFaculty, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve departments.", details: (error as any).message },
      500
    );
  }
};



export const getDepartmentById = async (c: any) => {
  try {
    const departmentId = c.req.query("id");
    if (!departmentId) {
      return c.json({ error: "Department ID is required." }, 400);
    }

    const departments = await db
      .select()
      .from(department)
      .leftJoin(faculty, sql`${department.facultyId} = ${faculty.id}`)
      .where(sql`${department.id} = ${departmentId}`)
      .limit(1);

    if (departments.length === 0) {
      return c.json({ error: "Department not found." }, 404);
    }

    return c.json(departments[0], 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve department.", details: (error as any).message },
      500
    );
  }
};


export const getidallDepartmentsforfacultyidshowfaculty = async (c: any) => {
  try {
    const facultyId = c.req.query("id");
    if (!facultyId) {
      return c.json({ error: "Faculty ID is required." }, 400);
    }

    const departments = await db
      .select()
      .from(department)
      .leftJoin(faculty, sql`${department.facultyId} = ${faculty.id}`)
      .where(sql`${faculty.id} = ${facultyId}`);  

    return c.json(departments, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve department.", details: (error as any).message },
      500
    );
  }
};



export const getIdfaculty = async (c: any) => {
  try {
    const facultyId = c.req.query("id");
    if (!facultyId) {
      return c.json({ error: "Faculty ID is required." }, 400);
    }

    const faculties = await db
      .select()
      .from(faculty)
      .where(sql`${faculty.id} = ${facultyId}`);
    return c.json(faculties, 200);
  } catch (error) {
    console.error(error);    
    return c.json(
      { error: "Failed to retrieve faculty.", details: (error as any).message },
      500
    );
  }
};



export const getdepartmentbyname = async (c: any) => {
  try {
    const name = c.req.query("name");
    if (!name) {
      return c.json({ error: "Name is required." }, 400);
    }
    const departments = await db
      .select({
        id: department.id,
        description: department.description,
        facultyId: faculty.description,
      })
      .from(department)
      .leftJoin(faculty, sql`${department.facultyId} = ${faculty.id}`)
      .where(sql`${department.description} LIKE ${'%' + name + '%'}`)
      .limit(10);

    if (departments.length === 0) {
      return c.json({ message: "No departments found." }, 404);
    }
    return c.json(departments, 200);    
  } catch (error) {
    console.error(error);    
    return c.json(
      { error: "Failed to retrieve department.", details: (error as any).message },
      500
    );
  }
};



export const getAllDepartments = async (c: any) => {
  try {
    const departments = await db
      .select()
      .from(department)
      .orderBy(department.name);
    return c.json(departments, 200);
  } catch (error) {
    console.error(error);    
    return c.json(
      { error: "Failed to retrieve departments.", details: (error as any).message },
      500
    );
  }
};



