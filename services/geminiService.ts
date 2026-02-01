import { GoogleGenAI, Type } from "@google/genai";
import { AuditResults } from "../types";

export const performAudit = async (
  registryBase64: string,
  earningsBase64: string,
  statementBase64: string
): Promise<AuditResults> => {
  // Use the API key from environment variables
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error(
      "API Key Missing: Please go to Vercel Settings -> Environment Variables, add API_KEY, and then REDEPLOY your app."
    );
  }

  // Initialize the AI with the detected key
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are XisaabiyePro, an elite Forensic Financial Auditor. 
    Audit these three documents with absolute precision:
    1. User Registry (Master list of users)
    2. Daily Earnings (Use 'Debit' column for amount each user owes)
    3. Bank Statement (Check for incoming credits matching user IDs or accounts)

    AUDIT RULES:
    - Match users from "Daily Earnings" to the "Bank Statement".
    - Calculate Owed = Total of 'Debit' column for that user.
    - Calculate Sent = Total found in Bank Statement.
    - Balance = Sent - Owed.

    Be extremely accurate. Identify users who have not paid anything.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Flash is faster and more reliable on Free Tier
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

    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response. Please try again.");
    
    return JSON.parse(text) as AuditResults;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("Invalid API Key. Please check your key in Google AI Studio and update Vercel.");
    }
    throw new Error(`Audit Failed: ${error.message || "Unknown error during document analysis."}`);
  }
};