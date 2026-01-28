import { GoogleGenAI, Type } from "@google/genai";
import { AuditResults } from "../types";

export const performAudit = async (
  registryBase64: string,
  earningsBase64: string,
  statementBase64: string
): Promise<AuditResults> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are XisaabiyePro, an elite Forensic Financial Auditor. 
    Audit these three documents with absolute precision:
    1. User Registry (Names, Phones, IDs)
    2. Daily Earnings (Use 'Debit' column for amount owed)
    3. Bank Statement (Incoming credits)

    CORE AUDIT LOGIC:
    - Only analyze users present in the "Daily Earnings" PDF.
    - Calculate Total Owed from the 'Debit' column in Earnings.
    - Calculate Total Sent from matching entries in the Bank Statement.
    - Balance = Total Sent - Total Owed.

    SUMMARY REQUIREMENT (MINIMAL & STRICT):
    - The "summaryNote" must be a simple, non-conversational list in English.
    - Format it exactly as follows:
      "Underpaid: [UserID] missing $[Amount], [UserID] missing $[Amount]... Overpaid: [UserID] +$[Amount]..."
    - Do not add any greetings, conclusions, or "noisy" professional filler. Just the data.

    Wait until you have cross-checked every transaction before finalizing the JSON output.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
      thinkingConfig: { thinkingBudget: 2048 },
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
              required: ["userId", "userName", "totalOwed", "totalSent", "balance", "accountBreakdown"]
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
                amount: { type: Type.NUMBER },
                transactionRef: { type: Type.STRING }
              },
              required: ["accountNumber", "date", "amount", "transactionRef"]
            }
          },
          summaryNote: { type: Type.STRING }
        },
        required: ["userSummaries", "missingPayments", "unknownAccounts", "summaryNote"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as AuditResults;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Audit processing error: Failed to generate structured results. Please retry.");
  }
};