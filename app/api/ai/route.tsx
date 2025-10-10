export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) {
      console.error("[v0] AI API Error: NVIDIA_API_KEY not configured")
      return Response.json(
        { error: "NVIDIA API key not configured. Please add it in the Vars section." },
        { status: 500 },
      )
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
- ALWAYS put each equation on its own line using $$ delimiters (display math)
- NEVER mix equations inline with text - always put them in separate blocks
- ALWAYS use \\frac{numerator}{denominator} for fractions - NEVER use slash notation
- NEVER use $ signs inside $$ blocks - only use $$ at the start and end

LaTeX formatting rules:
- Put EACH equation on its own line with $$...$$
- Do NOT use $ inside $$ blocks
- Fractions: \\frac{x^3}{3} NOT x^3/3
- Integrals: \\int_a^b f(x) \\, dx
- Evaluation brackets: \\left. \\frac{x^3}{3} \\right|_a^b
- Use proper LaTeX commands for all math

Example:
User: "what is the integral of x squared from 0 to 100?"

Good format:
The integral of x squared is:
$$\\int_0^{100} x^2 \\, dx$$

Using the power rule, the antiderivative is:
$$\\frac{x^3}{3}$$

Evaluating from 0 to 100:
$$\\frac{100^3}{3} - \\frac{0^3}{3} = \\frac{1000000}{3}$$

The final answer is approximately 333,333.33.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 2048,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] AI API Error:", response.status, errorText)
      return Response.json(
        { error: `NVIDIA API error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let inThinkingBlock = false

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("No response body")
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices[0]?.delta?.content || ""
                  if (!content) continue

                  // Filter out thinking blocks in real-time
                  let processedContent = content

                  if (content.includes("<Thinking>")) {
                    inThinkingBlock = true
                    processedContent = content.split("<Thinking>")[0]
                  }

                  if (inThinkingBlock) {
                    if (content.includes("</Thinking>")) {
                      inThinkingBlock = false
                      const afterThink = content.split("</Thinking>").slice(1).join("<Thinking>")
                      processedContent = afterThink
                    } else {
                      processedContent = ""
                    }
                  }

                  if (processedContent) {
                    controller.enqueue(encoder.encode(processedContent))
                  }
                } catch (e) {
                  console.error("[v0] Error parsing SSE data:", e)
                }
              }
            }
          }
          controller.close()
        } catch (error) {
          console.error("[v0] Stream error:", error)
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
