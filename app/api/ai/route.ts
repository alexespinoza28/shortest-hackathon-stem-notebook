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
          content: "/think You are a helpful STEM tutor assistant. Provide clear, detailed explanations for mathematical, scientific, and programming concepts. Use LaTeX notation for math when appropriate.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 2048,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
      extra_body: {
        min_thinking_tokens: 1024,
        max_thinking_tokens: 2048,
      },
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
