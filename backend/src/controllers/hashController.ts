import { Context, Hono } from "hono";

import crypto from "crypto";

export const md5 = async (c: Context) => {
  const inputTxt = c.req.param("inputTxt");

  try {
    const md5Hash = crypto.createHash("md5").update(inputTxt).digest("hex");

    return c.json({ md5: md5Hash }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed ", details: (error as Error).message }, 500);
  }
};
