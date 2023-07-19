import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "../../../lib/prisma";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGET(res)

      default:
        throw new Error(
          `The HTTP ${req.method} method is not supported at this route.`,
        )
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGET(res: NextApiResponse) {
  const result = await prisma.otelColConfig.findMany();
  res.json(result);
}
