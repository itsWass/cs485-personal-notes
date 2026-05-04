import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ExtractedConcepts {
  concepts: string[];
  summary: string;
  topics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  searchQueries: {
    github: string[];
    youtube: string[];
    articles: string[];
  };
}

async function ask(prompt: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });
  return res.choices[0]?.message?.content ?? "";
}

export async function extractConcepts(
  content: string,
  title: string
): Promise<ExtractedConcepts> {
  const text = await ask(`Analyze this note and extract structured knowledge for a recommendation system.

Title: ${title}
Content: ${content.slice(0, 4000)}

Respond with ONLY valid JSON in this exact format:
{
  "concepts": ["concept1", "concept2"],
  "summary": "2-3 sentence summary",
  "topics": ["topic1", "topic2"],
  "difficulty": "beginner",
  "searchQueries": {
    "github": ["query1", "query2"],
    "youtube": ["query1", "query2"],
    "articles": ["query1", "query2"]
  }
}

Extract 5-10 key concepts, 3-5 broader topics, and 2 targeted search queries per source. difficulty must be beginner, intermediate, or advanced.`);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse response");
  return JSON.parse(jsonMatch[0]);
}

export async function generateSemanticLinks(
  concepts1: string[],
  concepts2: string[]
): Promise<{ score: number; sharedThemes: string[] }> {
  const text = await ask(`Compare these two concept sets and find semantic connections.

Set A: ${concepts1.join(", ")}
Set B: ${concepts2.join(", ")}

Respond ONLY with JSON:
{"score": 0.0, "sharedThemes": ["theme1"]}

score is 0.0 (unrelated) to 1.0 (highly related).`);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { score: 0, sharedThemes: [] };
  return JSON.parse(jsonMatch[0]);
}

export async function generateDiscoveryInsight(
  concept: string,
  relatedConcepts: string[]
): Promise<string> {
  return ask(`Write one engaging sentence (max 20 words) explaining why someone studying "${concept}" should also explore: ${relatedConcepts.slice(0, 3).join(", ")}.`);
}
