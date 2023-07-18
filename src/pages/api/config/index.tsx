import type { NextApiRequest, NextApiResponse } from 'next'
import { useConfig } from '~/queries/config';
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const configId = req.query.id?.toString() || '';
  try {
    switch (req.method) {
      case 'POST':
        return handlePOST(req, res)

      case 'DELETE':
        return handleDELETE(configId, res)

      case 'GET':
        return handleGET(configId, res)

      case 'PUT':
        return handlePUT(configId, req, res)

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

async function handlePOST(req: NextApiRequest, res: NextApiResponse<any>) {
  const result = await prisma.otelColConfig.create({
    data: {
      ...req.body,
    },
  });
  res.json(result);
}

async function handleDELETE(configId: string, res: NextApiResponse<any>) {
  const result = await prisma.otelColConfig.delete({
    where: { id: configId },
  })
  return res.json(result)
}

async function handleGET(configId: string, res: NextApiResponse<any>) {
  const result = await prisma.otelColConfig.findUnique({
    where: {
      id: configId,
    },
  });
  return res.json(result);
}

async function handlePUT(configId: string, req: NextApiRequest, res: NextApiResponse<any>) {
  const result = await prisma.otelColConfig.update({
    where: { id: configId }
    ,
    data: {
      ...req.body,
    },
  });
  res.json(result);
}

