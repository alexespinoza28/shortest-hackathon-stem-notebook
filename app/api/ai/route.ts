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

    // Create completion with NVIDIA Nemotron 9B model with streaming
    const completion = await client.chat.completions.create({
      model: "nvidia/nvidia-nemotron-nano-9b-v2",
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
- ALWAYS use proper LaTeX notation wrapped in $ delimiters for ALL mathematical expressions
- ALWAYS use \\frac{numerator}{denominator} for fractions - NEVER use slash notation like x^3/3
- Wrap inline math in $ signs: $x^2$, $\\frac{x^3}{3}$, $\\int_0^{100} x^2 \\, dx$
- Use display math with $$ for important equations

LaTeX formatting rules:
- Fractions: $\\frac{x^3}{3}$ NOT x^3/3 or x³/3
- Integrals: $\\int_a^b f(x) \\, dx$
- Superscripts: $x^2$ NOT x^2 or x²
- Subscripts: $x_1$ NOT x_1

Example:
User: "what is the integral of x squared from 0 to 100?"
Bad: "The integral of x^2 from 0 to 100 equals 100^3/3"
Good: "The integral $\\int_0^{100} x^2 \\, dx = \\frac{x^3}{3}$ evaluated from 0 to 100 equals $\\frac{100^3}{3} = \\frac{1000000}{3}$"`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 2048,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    })

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    let fullResponse = ""
    let inThinkingBlock = false

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (!content) continue

            fullResponse += content

            // Filter out thinking blocks in real-time
            let processedContent = content

            // Check if we're entering a thinking block
            if (content.includes("<think>")) {
              inThinkingBlock = true
              processedContent = content.split("<think>")[0]
            }

            // Skip content if we're in a thinking block
            if (inThinkingBlock) {
              // Check if we're exiting the thinking block
              if (content.includes("</think>")) {
                inThinkingBlock = false
                const afterThink = content.split("</think>").slice(1).join("</think>")
                processedContent = afterThink
              } else {
                processedContent = ""
              }
            }

            if (processedContent) {
              controller.enqueue(encoder.encode(processedContent))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("[v0] AI API Error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate AI response" },
      { status: 500 },
    )
  }
}
