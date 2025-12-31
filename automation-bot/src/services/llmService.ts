import OpenAI from "openai";
import env from "../config/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface RewriteRequest {
  originalTitle: string;
  originalContent: string;
  referenceSummaries: string;
}

export async function rewriteArticle({ originalTitle, originalContent, referenceSummaries }: RewriteRequest) {
  const prompt = `You are an expert editor. Rewrite the following article to improve structure, tone, and formatting.
- Preserve factual accuracy.
- Avoid plagiarism.
- Use markdown headings and short paragraphs.
- Add a final section titled "References" citing the two supporting sources provided.

Original Title: ${originalTitle}
Original Article:
${originalContent}

Supporting Sources:
${referenceSummaries}`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    temperature: 0.6,
  });

  const text = response.output_text?.[0];
  if (!text) {
    throw new Error("LLM response missing text content");
  }
  return text;
}
