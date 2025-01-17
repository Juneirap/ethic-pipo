import conMysql from "../ultis/connectDB";
import { prename } from "../db/schema";
import { sql } from "drizzle-orm";

const db = await conMysql();

export const getAllPrename = async (c: any) => {
    try {
        const allPrename = await db.select().from(prename);
        return c.json(allPrename, 200);
    } catch (error) {
        console.error(error);
        return c.json(
            { error: "Failed to retrieve prenames.", details: (error as any).message },
            500
        );
    }
};