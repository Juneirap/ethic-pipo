import conMysql from "../ultis/connectDB";
import { 
  petition, 
  petitionLevel, 
  petitionObjectiveType, 
  petitionResearchType, 
  petitionStatus, 
  petitionType, 
  petitionGrant, 
  staff, 
  researcher, 
  department,
  faculty,
  prename,
  petitionFiles,
  petitionDocumentType
 } from "../db/schema";
import { sql, eq } from "drizzle-orm";
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';

const db = await conMysql();

// Get all petitions
export const getAllPetitions = async (c: any) => {
  try {
    const allPetitions = await db
      .select(
        {
          id: petition.id,
          correspondenceNo: petition.correspondenceNo,
          title_th: petition.title_th,
          title_en: petition.title_en,
          objective: petitionObjectiveType.description,
          grant: petitionGrant.description,
          typeId: petitionType.id, // Add typeId
          typeDescription: petitionType.description, // Add type description
          statusId: petitionStatus.id, // Add statusId
          statusDescription: petitionStatus.description, // Add status description
          researcher: sql`CONCAT(${researcher.name}, ' ', ${researcher.surname})`,
          currentLevel: petitionLevel.description,
          currentLevelId: petition.currentLevelId,
          staff: sql`CONCAT(${staff.name}, ' ', ${staff.surname})`,
          note: petition.note,
          created_at: sql`DATE_FORMAT(${petition.createdAt}, '%H:%i : %d-%m-%Y')`,
        }
      )
      .from(petition)
      .leftJoin(petitionLevel, sql`${petition.currentLevelId} = ${petitionLevel.id}`)
      .leftJoin(petitionObjectiveType, sql`${petition.objectiveId} = ${petitionObjectiveType.id}`)
      .leftJoin(petitionResearchType, sql`${petition.researchTypeId} = ${petitionResearchType.id}`)
      .leftJoin(petitionStatus, sql`${petition.statusId} = ${petitionStatus.id}`)
      .leftJoin(petitionType, sql`${petition.typeId} = ${petitionType.id}`)
      .leftJoin(petitionGrant, sql`${petition.grantId} = ${petitionGrant.id}`)
      .leftJoin(staff, sql`${petition.staffId} = ${staff.id}`)
      .leftJoin(researcher, sql`${petition.researcherId} = ${researcher.id}`);

    return c.json(allPetitions, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve petitions.", details: (error as any).message },
      500
    );
  }
};

export const getPetitionById = async (c: any) => {
  try {
    const petitionId = c.req.query("id");
    if (!petitionId) {
      return c.json({ error: "Petition ID is required." }, 400);
    }

    const result = await db
      .select({
        id: petition.id,
        correspondenceNo: petition.correspondenceNo,
        title_th: petition.title_th,
        title_en: petition.title_en,
        objectiveId: petition.objectiveId,
        objectiveOther: petition.objectiveOther,
        grantId: petition.grantId,
        grantOther: petition.grantOther,
        researchTypeId: petition.researchTypeId,
        currentLevelId: petition.currentLevelId,
        researcherId: petition.researcherId,
        typeId: petition.typeId,
        statusId: petition.statusId,
        note: petition.note,
        staffId: petition.staffId,
        researcher: {
          id: researcher.id,
          prenameId: researcher.prenameId,
          description: prename.description,
          name: researcher.name,
          surname: researcher.surname,
          telNo: researcher.telNo,
          email: researcher.email,
          department: {
            id: department.id,
            description: department.description,
            facultyId: department.facultyId
          },
          faculty: {
            id: faculty.id,
            description: faculty.description,
            telNo: faculty.telNo
          }
        }
      })
      .from(petition)
      .leftJoin(researcher, eq(petition.researcherId, researcher.id))
      .leftJoin(prename, eq(researcher.prenameId, prename.id))
      .leftJoin(department, eq(researcher.departmentId, department.id))
      .leftJoin(faculty, eq(department.facultyId, faculty.id))
      .where(sql`${petition.id} = ${petitionId}`)
      .limit(1);

    if (!result.length) {
      return c.json({ error: "Petition not found." }, 404);
    }

    const petitionData = result[0];
    return c.json({ petition: petitionData }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve petition.", details: (error as any).message },
      500
    );
  }
};

// Add new petition
export const addPetition = async (c: any) => {
  try {
    const {
      correspondenceNo,
      title_th,
      title_en,
      objectiveId,
      objectiveOther,
      grantId,
      grantOther,
      typeId,
      statusId,
      researcherId,
      currentLevelId,
      staffId,
      note,
    } = await c.req.json();

    // Validate required fields
    if (
      !correspondenceNo ||
      !title_th ||
      !title_en ||
      !objectiveId ||
      !grantId ||
      !typeId ||
      !statusId ||
      !researcherId ||
      !currentLevelId ||
      !staffId
    ) {
      return c.json({ error: "All required fields must be filled." }, 400);
    }

    // Validate objectiveOther when objectiveId is 3
    if (objectiveId === 3 && !objectiveOther) {
      return c.json({ error: "Please specify other objective details." }, 400);
    }

    // Validate grantOther when grantId is 3
    if (grantId === 3 && !grantOther) {
      return c.json({ error: "Please specify other grant source details." }, 400);
    }

    await db.insert(petition).values({
      correspondenceNo,
      title_th,
      title_en,
      objectiveId,
      objectiveOther: objectiveId === 3 ? objectiveOther : null,
      grantId,
      grantOther: grantId === 3 ? grantOther : null,
      typeId,
      statusId,
      researcherId,
      currentLevelId,
      staffId,
      note,
    });

    return c.json({ message: "Petition added successfully!" }, 201);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to add petition.", details: (error as any).message },
      500
    );
  }
};

export const deletePetition = async (c: any) => {
  try {
    const petitionId = c.req.query("id");
    if (!petitionId) {
      return c.json({ error: "Petition ID is required." }, 400);
    }
    await db.delete(petition).where({ id: petitionId });
    return c.json({ message: "Petition deleted successfully!" }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to delete petition.", details: (error as any).message },
      500
    );
  }
};

export const getlatestpetition = async (c: any) => {
  try {
    const latestpetition = await db
      .select()
      .from(petition)
      .orderBy(sql`${petition.id} DESC`)
      .limit(1);
    return c.json(latestpetition, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve latest petition.", details: (error as any).message },
      500
    );
  }
};

export const updatePetition = async (c: any) => {
  try {
    const petitionId = c.req.query("id");
    if (!petitionId) {
      return c.json({ error: "Petition ID is required." }, 400);
    }
    const {
      objectiveId,
      objectiveOther,
      grantId,
      grantOther,
      typeId,
      statusId,
      researcherId,
      currentLevelId,
      staffId,
      note,
    } = await c.req.json();

    await db
      .update(petition)
      .set({
        objectiveId,
        objectiveOther: objectiveId === 3 ? objectiveOther : null,
        grantId,
        grantOther: grantId === 3 ? grantOther : null,
        typeId,
        statusId,
        researcherId,
        currentLevelId,
        staffId,
        note,
      })
      .where({ id: petitionId });

    return c.json({ message: "Petition updated successfully!" }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to update petition.", details: (error as any).message },
      500
    );
  }
};

export const searchPetitionsByPhoneNumber = async (c: any) => {
  try {
    const phoneNumber = c.req.query("telNo");

    if (!phoneNumber) {
      return c.json({ error: "Phone number is required." }, 400);
    }

    const petitionsByPhoneNumber = await db
      .select(
        {
          id: petition.id,
          correspondenceNo: petition.correspondenceNo,
          title_th: petition.title_th,
          title_en: petition.title_en,
          objective: petitionObjectiveType.description,
          grant: petitionGrant.description,
          typeId: petitionType.id, // Add typeId
          typeDescription: petitionType.description, // Add type description
          statusId: petitionStatus.id, // Add statusId
          statusDescription: petitionStatus.description, // Add status description
          researcher: sql`CONCAT(${researcher.name}, ' ', ${researcher.surname})`,
          currentLevel: petitionLevel.description,
          currentLevelId: petition.currentLevelId,
          staff: sql`CONCAT(${staff.name}, ' ', ${staff.surname})`,
          note: petition.note,
          created_at: sql`DATE_FORMAT(${petition.createdAt}, '%H:%i : %d-%m-%Y')`,
        }
      )
      .from(petition)
      .leftJoin(petitionLevel, sql`${petition.currentLevelId} = ${petitionLevel.id}`)
      .leftJoin(petitionObjectiveType, sql`${petition.objectiveId} = ${petitionObjectiveType.id}`)
      .leftJoin(petitionResearchType, sql`${petition.researchTypeId} = ${petitionResearchType.id}`)
      .leftJoin(petitionStatus, sql`${petition.statusId} = ${petitionStatus.id}`)
      .leftJoin(petitionType, sql`${petition.typeId} = ${petitionType.id}`)
      .leftJoin(petitionGrant, sql`${petition.grantId} = ${petitionGrant.id}`)
      .leftJoin(staff, sql`${petition.staffId} = ${staff.id}`)
      .leftJoin(researcher, sql`${petition.researcherId} = ${researcher.id}`)
      .where(sql`${researcher.telNo} = ${phoneNumber}`);

    if (!petitionsByPhoneNumber.length) {
      return c.json({ message: "ไม่พบหมายเลขโทรศัพท์" }, 404);
    }

    return c.json(petitionsByPhoneNumber, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to search petitions.", details: (error as any).message },
      500
    );
  }
};

export const getPetitionFilesByPetitionId = async (c: any) => {
  try {
    const petitionId = c.req.query("petitionId");
    if (!petitionId) {
      return c.json({ error: "Petition ID is required." }, 400);
    }

    const files = await db
      .select({
        id: petitionFiles.id,
        name: petitionFiles.name,
        extension: petitionFiles.extension,
        md5: petitionFiles.md5,
        petitionId: petitionFiles.petitionId,
        documentTypeId: petitionFiles.documentTypeId,
        documentType: {
          id: petitionDocumentType.id,
          description: petitionDocumentType.description
        }
      })
      .from(petitionFiles)
      .leftJoin(
        petitionDocumentType,
        eq(petitionFiles.documentTypeId, petitionDocumentType.id)
      )
      .where(eq(petitionFiles.petitionId, parseInt(petitionId)));

    if (!files.length) {
      return c.json({ message: "ไม่พบเอกสาร" }, 404);
    }

    return c.json({ files }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "ไม่สามารถเรียกไฟล์ได้", details: (error as any).message },
      500
    );
  }
};

export const openFile = async (c: any) => {
  try {
    const filename = c.req.param('filename');
    const filePath = path.join(__dirname, '../../../uploads', filename);
    
    // Create a read stream
    const fileStream = createReadStream(filePath);
    
    // Set headers for PDF files
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `inline; filename="${filename}"`);
    
    // Return the file stream
    return c.newResponse(fileStream);

  } catch (error) {
    console.error('Error opening file:', error);
    return c.json({ message: 'Error opening file' }, 500);
  }
};

export const getAllPetitionsSubcommittee = async (c: any) => {
  try {
    const allPetitions = await db
      .select(
        {
          id: petition.id,
          correspondenceNo: petition.correspondenceNo,
          title_th: petition.title_th,
          title_en: petition.title_en,
          objective: petitionObjectiveType.description,
          grant: petitionGrant.description,
          typeId: petitionType.id, // Add typeId
          typeDescription: petitionType.description, // Add type description
          statusId: petitionStatus.id, // Add statusId
          statusDescription: petitionStatus.description, // Add status description
          researcher: sql`CONCAT(${researcher.name}, ' ', ${researcher.surname})`,
          currentLevel: petitionLevel.description,
          currentLevelId: petition.currentLevelId,
          staff: sql`CONCAT(${staff.name}, ' ', ${staff.surname})`,
          note: petition.note,
          created_at: sql`DATE_FORMAT(${petition.createdAt}, '%H:%i : %d-%m-%Y')`,
        }
      )
      .from(petition)
      .leftJoin(petitionLevel, sql`${petition.currentLevelId} = ${petitionLevel.id}`)
      .leftJoin(petitionObjectiveType, sql`${petition.objectiveId} = ${petitionObjectiveType.id}`)
      .leftJoin(petitionResearchType, sql`${petition.researchTypeId} = ${petitionResearchType.id}`)
      .leftJoin(petitionStatus, sql`${petition.statusId} = ${petitionStatus.id}`)
      .leftJoin(petitionType, sql`${petition.typeId} = ${petitionType.id}`)
      .leftJoin(petitionGrant, sql`${petition.grantId} = ${petitionGrant.id}`)
      .leftJoin(staff, sql`${petition.staffId} = ${staff.id}`)
      .leftJoin(researcher, sql`${petition.researcherId} = ${researcher.id}`);

    return c.json(allPetitions, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve petitions.", details: (error as any).message },
      500
    );
  }
};