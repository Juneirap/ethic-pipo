import conMysql from "../ultis/connectDB";
import { petitionCommittee, committee , petition, staff, petitionStatus, petitionLevel } from "../db/schema";
import { sql } from "drizzle-orm";

const db = await conMysql();

export const petitionCommitteeWithCommittee = async (c: any) => {
    try {
        const petitionCommitteeWithCommittee = await db
            .select(
                {
                    id: petitionCommittee.id,
                    petitionId: petitionCommittee.petitionId,
                    levelId: petitionLevel.description,
                    committee: sql`CONCAT(${committee.name}, ' ', ${committee.surname})`,
                    status: petitionStatus.description,
                    note: petitionCommittee.note,
                    approvedByStaff: sql`CONCAT(${staff.name}, ' ', ${staff.surname})`,
                }
            )
            .from(petitionCommittee)
            .leftJoin(committee, sql`${petitionCommittee.committeeId} = ${committee.id}`)
            .leftJoin(petitionStatus, sql`${petitionCommittee.statusId} = ${petitionStatus.id}`)
            .leftJoin(staff, sql`${petitionCommittee.approvedByStaff} = ${staff.id}`)
            .leftJoin(petitionLevel, sql`${petitionCommittee.levelId} = ${petitionLevel.id}`);

            if (!petitionCommitteeWithCommittee.length) {
                return c.json({ error: "Petition committees not found." }, 404);
            }

            return c.json(petitionCommitteeWithCommittee, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve petition committees.", details: (error as any).message },
            500
        );
    }
};

export const addPetitionCommittee = async (c: any) => {
    try {
        const { petitionId, levelId, committeeId, statusId, note, approvedByStaff } = await c.req.json();
        await db.insert(petitionCommittee).values({
            petitionId,
            levelId,
            committeeId,
            statusId,
            note,
            approvedByStaff,
        });
        return c.json({ message: "Petition committee added successfully!" }, 201);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to add petition committee.", details: (error as any).message },
            500
        );
    }
};

export const deletePetitionCommittee = async (c: any) => {
    try {
        const petitionCommitteeId = c.req.query("id"); // รับค่า id จาก query parameter
        if (!petitionCommitteeId) {
            return c.json({ error: "Petition committee ID is required." }, 400);
        }
        await db.delete(petitionCommittee).where({ id: petitionCommitteeId });
        return c.json({ message: "Petition committee deleted successfully!" }, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to delete petition committee.", details: (error as any).message },
            500
        );
    }
};

export const getPetitionCommitteeById = async (c: any) => {
    try {
        const petitionCommitteeId = c.req.query("id");
        if (!petitionCommitteeId) {
            return c.json({ error: "Petition committee ID is required." }, 400);
        }
        const petitionCommitteeWithCommittee = await db
            .select(
                {
                    id: petitionCommittee.id,
                    petitionId: petitionCommittee.petitionId,
                    level: petitionLevel.description,
                    committee: sql`CONCAT(${committee.name}, ' ', ${committee.surname})`,
                    status: petitionStatus.description,
                    note: petitionCommittee.note,
                    approvedByStaff: sql`CONCAT(${staff.name}, ' ', ${staff.surname})`,
                }
            )
            .from(petitionCommittee)
            .leftJoin(committee, sql`${petitionCommittee.committeeId} = ${committee.id}`)
            .leftJoin(petition, sql`${petitionCommittee.petitionId} = ${petition.id}`)
            .leftJoin(petitionLevel, sql`${petitionCommittee.levelId} = ${petitionLevel.id}`)
            .leftJoin(staff, sql`${petitionCommittee.approvedByStaff} = ${staff.id}`)
            .leftJoin(petitionStatus, sql`${petitionCommittee.statusId} = ${petitionStatus.id}`)
            .where(sql`${petitionCommittee.id} = ${petitionCommitteeId}`)
            .limit(1);

        if (!petitionCommitteeWithCommittee.length) {
            return c.json({ error: "Petition committee not found." }, 404);
        }

        return c.json(petitionCommitteeWithCommittee[0], 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve petition committee.", details: (error as any).message },
            500
        );
    }
};
