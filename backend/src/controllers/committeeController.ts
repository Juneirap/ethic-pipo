import conMysql from "../ultis/connectDB";
import { committee, prename, committeePosition } from "../db/schema";
import { sql } from "drizzle-orm";

const db = await conMysql();

// Get all committees
export const getAllCommitteesWithPrenameCommitteePosition = async (c: any) => {
  try {
    const allCommitteesWithPrenameCommitteePosition = await db
      .select(
        {
          id: committee.id,
          name: sql`CONCAT(${prename.description}, ${committee.name}, ' ', ${committee.surname})`,
          position: committeePosition.description,
          description: committee.description,
          telNo: committee.telNo,
        }
      )
      .from(committee)
      .leftJoin(prename, sql`${committee.prenameId} = ${prename.id}`)
      .leftJoin(committeePosition, sql`${committee.positionId} = ${committeePosition.id}`);
    return c.json(allCommitteesWithPrenameCommitteePosition, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve committees.", details: (error as any).message },
      500
    );
  }
}

// Add new committee
export const addCommittee = async (c: any) => {
  try {
    const { prenameId, name, surname, positionId, description, telNo } =
      await c.req.json();

    if (!prenameId || !name || !surname || !positionId || !description || !telNo) {
      return c.json({ error: "All fields are required." }, 400);
    }

    await db.insert(committee).values({
      prenameId,
      name,
      surname,
      positionId,
      description,
      telNo,
    });

    return c.json({ message: "Committee added successfully!" }, 201);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to add committee.", details: (error as any).message },
      500
    );
  }
};

// Get committee by ID
export const getCommitteeById = async (c: any) => {
  try {
    const committeeId = c.req.query("id");
    if (!committeeId) {
      return c.json({ error: "Committee ID is required." }, 400);
    }
    const committeeWithPrenameCommitteePosition = await db
      .select(
        {
          id: committee.id,
          name: sql`CONCAT(${prename.description}, ${committee.name}, ' ', ${committee.surname})`,
          position: committeePosition.description,
          description: committee.description,
          telNo: committee.telNo,
        }
      )
      .from(committee)
      .leftJoin(prename, sql`${committee.prenameId} = ${prename.id}`)
      .leftJoin(committeePosition, sql`${committee.positionId} = ${committeePosition.id}`)
      .where(sql`${committee.id} = ${committeeId}`)
      .limit(1);
    if (!committeeWithPrenameCommitteePosition.length) {
      return c.json({ error: "Committee not found." }, 404);
    }
    return c.json(committeeWithPrenameCommitteePosition[0], 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to retrieve committee.", details: (error as any).message },
      500
    );
  }  
};

export const deleteCommittee = async (c: any) => {
  try {
    const committeeId = c.req.query("id");
    if (!committeeId) {
      return c.json({ error: "Committee ID is required." }, 400);
    }
    await db.delete(committee).where({ id: committeeId });
    return c.json({ message: "Committee deleted successfully!" }, 200);
  } catch (error) {
    console.error(error);
    return c.json(
      { error: "Failed to delete committee.", details: (error as any).message },
      500
    );
  }
};