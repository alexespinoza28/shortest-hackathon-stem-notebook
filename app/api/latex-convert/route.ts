export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey || apiKey === "$API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC") {
      console.error("[v0] NVIDIA_API_KEY is not configured")
      return new Response(
        JSON.stringify({ error: "NVIDIA API key is not configured. Please add it in the Vars section." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("[v0] Converting text to LaTeX:", text)

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
            content: `You are a LaTeX code generator. Convert natural language math expressions to LaTeX syntax.
CRITICAL RULES:
- Output ONLY the raw LaTeX code, no explanations
- Use proper LaTeX commands with backslashes (\\)
- Do NOT include delimiters like $$, $, \\[, or \\]
- If input is already LaTeX, return it as-is

Examples:
Input: "integral of x squared"
Output: \\int x^2 \\, dx

Input: "integral of x squared from 0 to 100"
Output: \\int_0^{100} x^2 \\, dx

Input: "a over b equals c"
Output: \\frac{a}{b} = c

Input: "sum from n equals 1 to infinity of 1 over n squared"
Output: \\sum_{n=1}^{\\infty} \\frac{1}{n^2}

Input: "square root of 2"
Output: \\sqrt{2}

Input: "x squared plus y squared equals r squared"
Output: x^2 + y^2 = r^2

Input: "derivative of f with respect to x"
Output: \\frac{df}{dx}`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 512,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] NVIDIA API error:", response.status, errorText)
      return new Response(JSON.stringify({ error: `API request failed: ${response.status}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await response.json()
    const latexCode = data.choices?.[0]?.message?.content || ""

    console.log("[v0] Generated LaTeX:", latexCode)

    return new Response(JSON.stringify({ latex: latexCode.trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] LaTeX Conversion Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to convert to LaTeX"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
