
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResults } from "../types";

export const performAudit = async (
  registryBase64: string,
  earningsBase64: string,
  statementBase64: string
): Promise<AuditResults> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API Key Missing: Please configure API_KEY in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are XisaabiyePro, an elite Forensic Financial Auditor. 
    Audit these three documents with absolute precision:
    1. User Registry (Master list of users and associated account numbers/IDs)
    2. Daily Earnings (Use 'Debit' column for amount each user owes)
    3. Bank Statement (Check for incoming credits matching user IDs or accounts)

    AUDIT RULES:
    - Correlate users from "Daily Earnings" with payments in the "Bank Statement".
    - FOR EVERY PAYMENT FOUND: Extract the Date and the EXACT TIME (HH:mm).
    - LATE PAYMENT RULE: If a payment occurred AFTER 8:00 PM (20:00), set 'isLate' to true.
    - Calculate Owed = Total of 'Debit' column for that user.
    - Calculate Sent = Total of identified payments found in Bank Statement.
    - Balance = Sent - Owed.

    Be extremely accurate. If a user has NO matching payments, add them to missingPayments.
    If a payment exists in the statement but cannot be linked to a registry user, add to unknownAccounts.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: registryBase64 } },
            { inlineData: { mimeType: 'application/pdf', data: earningsBase64 } },
            { inlineData: { mimeType: 'application/pdf', data: statementBase64 } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            userSummaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  userId: { type: Type.STRING },
                  userName: { type: Type.STRING },
                  phoneNumber: { type: Type.STRING },
                  totalOwed: { type: Type.NUMBER },
                  totalSent: { type: Type.NUMBER },
                  balance: { type: Type.NUMBER },
                  matchedTransactions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        date: { type: Type.STRING },
                        time: { type: Type.STRING },
                        reference: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        isLate: { type: Type.BOOLEAN }
                      },
                      required: ["date", "time", "reference", "amount", "isLate"]
                    }
                  },
                  accountBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        accountNumber: { type: Type.STRING },
                        amountSent: { type: Type.NUMBER }
                      },
                      required: ["accountNumber", "amountSent"]
                    }
                  }
                },
                required: ["userId", "userName", "totalOwed", "totalSent", "balance", "accountBreakdown", "matchedTransactions"]
              }
            },
            missingPayments: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            unknownAccounts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  accountNumber: { type: Type.STRING },
                  date: { type: Type.STRING },
                  time: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  transactionRef: { type: Type.STRING }
                },
                required: ["accountNumber", "date", "time", "amount", "transactionRef"]
              }
            },
            summaryNote: { type: Type.STRING }
          },
          required: ["userSummaries", "missingPayments", "unknownAccounts", "summaryNote"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AuditResults;
  } catch (error: any) {
    if (error.message?.includes('429')) {
      throw new Error("Quota Exceeded: Please wait a moment and try again.");
    }
    throw new Error(`Audit Failed: ${error.message}`);
  }
};
