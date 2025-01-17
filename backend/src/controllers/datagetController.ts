import conMysql from "../ultis/connectDB";
import { petitionDocumentType,petitionGrant,petitionObjectiveType,petitionResearchType,petitionType } from "../db/schema";
import { sql } from "drizzle-orm";

const db = await conMysql();

export const getallDocumentType = async (c: any) => {
    try {
        const allDocumentType = await db
            .select()
            .from(petitionDocumentType);
        return c.json(allDocumentType, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve document types.", details: (error as any).message },
            500
        );
    }
};

export const getallGrant = async (c: any) => {
    try {
        const allGrant = await db
            .select()
            .from(petitionGrant);
        return c.json(allGrant, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve grant.", details: (error as any).message },
            500
        );
    }
};

export const getallObjectiveType = async (c: any) => {
    try {
        const allObjectiveType = await db
            .select()
            .from(petitionObjectiveType);
        return c.json(allObjectiveType, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve objective types.", details: (error as any).message },
            500
        );
    }
};


export const getallResearchType = async (c: any) => {
    try {
        const allResearchType = await db
            .select()
            .from(petitionResearchType);
        return c.json(allResearchType, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve research types.", details: (error as any).message },
            500
        );
    }
};

export const getallType = async (c: any) => {
    try {
        const allType = await db
            .select()
            .from(petitionType);
        return c.json(allType, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve types.", details: (error as any).message },
            500
        );
    }
};
// getDocumentTypeById1-11
export const getDocumentTypeById = async (c: any) => {
    try {
        const DocumentTypes = await db
            .select()
            .from(petitionDocumentType)
            .where(sql`${petitionDocumentType.id} BETWEEN 1 AND 11`);
        if (DocumentTypes.length === 0) {
            return c.json({ error: "No Document Types found in range 1-11." }, 404);
        }
        return c.json(DocumentTypes, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve document types.", details: (error as any).message },
            500
        );
    }
};

export const getIdGrant = async (c: any) => {
    try {
        const GrantId = c.req.query("id");
        if (!GrantId) {
            return c.json({ error: "Grant ID is required." }, 400);
        }
        const Grant = await db
            .select()
            .from(petitionGrant)
            .where(sql`${petitionGrant.id} = ${GrantId}`)
            .limit(1);
        return c.json(Grant, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve grant.", details: (error as any).message },
            500
        );
    }
};

export const getIdObjectiveType = async (c: any) => {
    try {
        const ObjectiveTypeId = c.req.query("id");
        if (!ObjectiveTypeId) {
            return c.json({ error: "Objective Type ID is required." }, 400);
        }
        const ObjectiveType = await db
            .select()
            .from(petitionObjectiveType)
            .where(sql`${petitionObjectiveType.id} = ${ObjectiveTypeId}`)
            .limit(1);
        return c.json(ObjectiveType, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve objective type.", details: (error as any).message },
            500
        );
    }
};

export const getIdResearchType = async (c: any) => {
    try {
        const ResearchTypeId = c.req.query("id");
        if (!ResearchTypeId) {
            return c.json({ error: "Research Type ID is required." }, 400);
        }
        const ResearchType = await db
            .select()
            .from(petitionResearchType)
            .where(sql`${petitionResearchType.id} = ${ResearchTypeId}`)
            .limit(1);
        return c.json(ResearchType, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve research type.", details: (error as any).message },           
            500
        );
    }
};

export const getIdType = async (c: any) => {
    try {
        const TypeId = c.req.query("id");
        if (!TypeId) {
            return c.json({ error: "Type ID is required." }, 400);
        }
        const Type = await db
            .select()
            .from(petitionType)
            .where(sql`${petitionType.id} = ${TypeId}`)
            .limit(1);
        return c.json(Type, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve type.", details: (error as any).message },
            500
        );
    }
};

