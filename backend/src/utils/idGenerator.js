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

export async function generateSequentialId(model, digits) {
  const prefix = PREFIX_MAP[model];
  if (!prefix) throw new Error(`No prefix defined for model: ${model}`);

  // Default digits: payments 7, others 4
  const defaultDigits = ["ReceivedPayment", "IssuedPayment"].includes(model)
    ? 7
    : 4;
  const numDigits = digits || defaultDigits;

  // Determine the field that stores the human-readable ID
  const idField =
    model === "Sale"
      ? "saleUuid"
      : model === "Purchase"
      ? "purchaseUuid"
      : ["ReceivedPayment", "IssuedPayment"].includes(model)
      ? "paymentNumber"
      : "id";

  // Find last created record
  const lastRecord = await prisma[model].findFirst({
    orderBy: { createdAt: "desc" },
    select: { [idField]: true },
  });

  let lastNumber = 0;
  if (lastRecord) {
    const value = lastRecord[idField];
    const match = value.match(/\d+$/);
    if (match) lastNumber = parseInt(match[0], 10);
  }

  const nextNumber = String(lastNumber + 1).padStart(numDigits, "0");
  return `${prefix}-${nextNumber}`;
}
