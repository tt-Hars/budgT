import { z } from "zod";

const parseResultSchema = z.object({
  amount: z.number().nullable().describe("The transaction amount"),
  currency: z.string().nullable().describe("The currency code (e.g., USD, EUR)"),
  date: z.string().nullable().describe("The date of the transaction in ISO format (YYYY-MM-DD)"),
  merchant: z.string().nullable().describe("The merchant or description of the transaction"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).nullable().describe("The type of transaction"),
  accountName: z.string().nullable().describe("The name of the account inferred from the text"),
});

export async function parseSMS(text: string, apiKey: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a financial assistant. specificallly designed to parse SMS transaction alerts.
            Extract the following details from the SMS text: amount, currency, date, merchant (or description), type (INCOME, EXPENSE, or TRANSFER), and accountName.
            If the date is missing, assume today. If the year is missing, assume current year.
            Return the result as a valid JSON object matching this schema:
            {
              "amount": number | null,
              "currency": string | null,
              "date": string | null,
              "merchant": string | null,
              "type": "INCOME" | "EXPENSE" | "TRANSFER" | null,
              "accountName": string | null
            }`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return parseResultSchema.parse(result);
  } catch (error) {
    console.error("Error parsing SMS:", error);
    throw error;
  }
}
