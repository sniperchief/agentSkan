import OpenAI from "openai";
import { RedFlag } from "@/types";

interface AIAnalysisResult {
  flags: RedFlag[];
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
}

export async function analyzeReadme(readmeContent: string): Promise<RedFlag[]> {
  if (!readmeContent || readmeContent.trim().length === 0) {
    return [
      {
        category: "Documentation",
        message: "Repository has no README content",
        severity: "medium",
      },
    ];
  }

  // Truncate if too long
  const truncatedContent = readmeContent.slice(0, 15000);

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a security analyst specializing in identifying red flags in AI agent project documentation. Analyze README files to identify potential scam indicators, suspicious claims, or concerning patterns.

Your task is to return a JSON object with an array of red flags found. Each flag should have:
- category: One of "Unrealistic Promises", "Missing Technical Details", "Pressure Tactics", "Suspicious Claims", "Financial Focus", "Poor Documentation"
- message: A specific description of the concern
- severity: "low", "medium", or "high"

Focus on identifying:
1. Unrealistic promises (guaranteed returns, impossible capabilities, too-good-to-be-true claims)
2. Missing technical details (vague architecture, no code explanations, buzzword soup)
3. Pressure tactics (urgency, limited time offers, FOMO language)
4. Suspicious claims (fake partnerships, unverifiable credentials, inflated metrics)
5. Token/financial focus over technical substance (emphasis on tokenomics, staking, rewards over actual functionality)
6. Poor documentation (broken links, placeholder text, copied content)

Return ONLY valid JSON in this format:
{
  "flags": [
    { "category": "...", "message": "...", "severity": "..." }
  ]
}

If the README appears legitimate with no red flags, return: { "flags": [] }`,
        },
        {
          role: "user",
          content: `Analyze this README for red flags:\n\n${truncatedContent}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const result: AIAnalysisResult = JSON.parse(content);
    return result.flags || [];
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    return [];
  }
}
