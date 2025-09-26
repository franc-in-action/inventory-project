// backend/src/utils/idGenerator.js
import { prisma } from "../prisma.js";

const PREFIX_MAP = {
  Sale: "SALE",
  Purchase: "PUR",
  Return: "RET",
  Adjustment: "ADJ",
  ReceivedPayment: "RPY",
  IssuedPayment: "IPY",
};

// Map model names to Prisma clients
const PRISMA_MODEL_MAP = {
  Sale: prisma.sale,
  Purchase: prisma.purchase,
  Return: prisma.return,
  Adjustment: prisma.ledgerEntry, // assuming adjustments are stored in ledgerEntry
  ReceivedPayment: prisma.receivedPayment,
  IssuedPayment: prisma.issuedPayment,
};

// Map model names to the ID field to use
const ID_FIELD_MAP = {
  Sale: "saleUuid",
  Purchase: "purchaseUuid",
  Return: "returnUuid",
  Adjustment: "id", // or a custom field if needed
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

  // Get the last record's ID
  const lastRecord = await prismaModel.findFirst({
    orderBy: { createdAt: "desc" },
    select: { [idField]: true },
  });

  let lastNumber = 0;
  if (lastRecord) {
    const value = lastRecord[idField];
    const match = value?.match(/\d+$/);
    if (match) lastNumber = parseInt(match[0], 10);
  }

  const nextNumber = String(lastNumber + 1).padStart(numDigits, "0");
  return `${prefix}-${nextNumber}`;
}
