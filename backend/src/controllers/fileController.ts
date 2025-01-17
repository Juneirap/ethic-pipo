import conMysql from "../ultis/connectDB";
import { petitionFiles, petition, petitionDocumentType } from "../db/schema";
import { sql } from "drizzle-orm";

const db = await conMysql();

export const getAllFilesWithPetitionandDocumentType = async (c: any) => {
    try {
        const allFilesWithPetitionandDocumentType = await db
            .select()
            .from(petitionFiles)
            .leftJoin(petition, sql`${petitionFiles.petitionId} = ${petition.id}`)
            .leftJoin(petitionDocumentType, sql`${petitionFiles.documentTypeId} = ${petitionDocumentType.id}`);
        return c.json(allFilesWithPetitionandDocumentType, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve files.", details: (error as any).message },
            500
        );
    }
}

export const getFileById = async (c: any) => {
    try {
        const fileId = c.req.query("id");
        if (!fileId) {
            return c.json({ error: "File ID is required." }, 400);
        }

        const files = await db
            .select()
            .from(petitionFiles)
            .leftJoin(petition, sql`${petitionFiles.petitionId} = ${petition.id}`)
            .leftJoin(petitionDocumentType, sql`${petitionFiles.documentTypeId} = ${petitionDocumentType.id}`)
            .where(sql`${petitionFiles.id} = ${fileId}`)
            .limit(1);

        if (files.length === 0) {
            return c.json({ error: "File not found." }, 404);
        }        

        return c.json(files[0], 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve file.", details: (error as any).message },
            500
        );
    }
}

export const addFile = async (c: any) => {
    try {
        const { name, extension, md5, petitionId, documentTypeId } = await c.req.json();
        await db.insert(petitionFiles).values({
            name,
            extension,
            md5,
            petitionId,
            documentTypeId,
        });
        return c.json({ message: "File added successfully!" }, 201);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to add file.", details: (error as any).message },
            500
        );
    }
}