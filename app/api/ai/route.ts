import { OpenAI } from "openai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Initialize OpenAI client with NVIDIA endpoint
    const client = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NVIDIA_API_KEY || "$API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC",
      dangerouslyAllowBrowser: true, // Safe in API routes - runs server-side only
    })

    // Create completion with NVIDIA Nemotron model
    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-nano-4b-v1.1",
      messages: [
        {
          role: "system",
          content: `You are a STEM tutor. Answer questions directly without any preamble or meta-commentary.

BAD responses (never do this):
- "Okay, the user wants me to explain..."
- "Let me start by..."
- "I should mention..."
- "First, I should define..."

GOOD responses (always do this):
- Start immediately with the answer
- Be clear and educational
- Use examples when helpful
- Use LaTeX for math: \\int, \\frac{a}{b}, etc.

Example:
User: "explain integrals"
Bad: "Okay, the user wants me to explain integrals. Let me start by..."
Good: "Integrals represent the area under a curve. There are two types: indefinite and definite..."`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 8192,
      stream: false,
    })

    let response = completion.choices[0]?.message?.content || "No response generated"

    // Post-process to remove meta-commentary if model still includes it
    const metaPhrases = [
      /^Okay,\s+the\s+user\s+(?:wants|said|asked)[^.!?]*[.!?]\s*/i,
      /^Let\s+me\s+(?:start|begin)[^.!?]*[.!?]\s*/i,
      /^I\s+should\s+[^.!?]*[.!?]\s*/i,
      /^First,\s+I\s+(?:should|will|need)[^.!?]*[.!?]\s*/i,
      /^(?:So|Then)\s+(?:I\s+should|let\s+me)[^.!?]*[.!?]\s*/i,
    ]

    for (const pattern of metaPhrases) {
      response = response.replace(pattern, "")
    }

    // Remove multiple leading spaces/newlines after cleaning
    response = response.replace(/^\s+/, "")

    return Response.json({ response })
  } catch (error) {
    console.error("[v0] AI API Error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate AI response" },
      { status: 500 },
    )
  }
}
