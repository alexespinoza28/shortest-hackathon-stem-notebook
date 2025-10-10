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
    })

    // Create completion with NVIDIA Nemotron model
    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-nano-4b-v1.1",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful STEM tutor assistant. Provide clear, detailed explanations for mathematical, scientific, and programming concepts. Use LaTeX notation for math when appropriate.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 8192,
      stream: false,
    })

    const response = completion.choices[0]?.message?.content || "No response generated"

    return Response.json({ response })
  } catch (error) {
    console.error("[v0] AI API Error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate AI response" },
      { status: 500 },
    )
  }
}
