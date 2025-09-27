// backend/src/utils/idGenerator.js
import { prisma } from "../prisma.js";

const PREFIX_MAP = {
  Sale: "SALE",
  Draft: "DRA", // NEW
  Purchase: "PUR",
  Return: "RET",
  Adjustment: "ADJ",
  ReceivedPayment: "RPY",
  IssuedPayment: "IPY",
};

// Map model names to Prisma clients
const PRISMA_MODEL_MAP = {
  Sale: prisma.sale,
  Draft: prisma.sale, // drafts are stored in the same Sale table
  Purchase: prisma.purchase,
  Return: prisma.return,
  Adjustment: prisma.ledgerEntry,
  ReceivedPayment: prisma.receivedPayment,
  IssuedPayment: prisma.issuedPayment,
};

// Map model names to the ID field to use
const ID_FIELD_MAP = {
  Sale: "saleUuid",
  Draft: "saleUuid", // use same field
  Purchase: "purchaseUuid",
  Return: "returnUuid",
  Adjustment: "id",
  ReceivedPayment: "paymentNumber",
  IssuedPayment: "paymentNumber",
};

export async function generateSequentialId(model, digits) {
  const prefix = PREFIX_MAP[model];
  if (!prefix) throw new Error(`No prefix defined for model: ${model}`);

  const prismaModel = PRISMA_MODEL_MAP[model];
  if (!prismaModel) throw new Error(`No Prisma model defined for: ${model}`);

  const idField = ID_FIELD_MAP[model];
  if (!idField) throw new Error(`No ID field defined for model: ${model}`);

  // Default digits: 7 for payments, 4 for others
  const defaultDigits = ["ReceivedPayment", "IssuedPayment"].includes(model)
    ? 7
    : 4;
  const numDigits = digits || defaultDigits;

  // Use a transaction to increment the sequence atomically
  const nextNumber = await prisma.$transaction(async (tx) => {
    const seq = await tx.sequence.upsert({
      where: { id: model },
      update: { lastValue: { increment: 1 } },
      create: { id: model, lastValue: 1 },
    });
    return seq.lastValue;
  });

  return `${prefix}-${String(nextNumber).padStart(numDigits, "0")}`;
}
