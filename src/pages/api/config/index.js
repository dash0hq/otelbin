// import prisma from "../../../lib/prisma";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
// POST /api/post
// Required fields in body: title, authorEmail
// Optional fields in body: content
// export default async function handle(req, res) {

//   const result = await prisma.otelColConfig.findMany();

//   res.json(result);
// }

// POST /api/user
// Required fields in body: name, email

export default async function handle(req, res) {
  try {
    if (req.method === "POST") {
      const result = await prisma.otelColConfig.create({
        data: {
          ...req.body,
        },
      });
      res.json(result);
    } else if (req.method === "GET") {
      const result = await prisma.otelColConfig.findMany();
      res.json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
