import { OpenAI } from "openai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return Response.json({ error: "Text is required" }, { status: 400 })
    }

    // Initialize OpenAI client with NVIDIA endpoint
    const client = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NVIDIA_API_KEY || "$API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC",
      dangerouslyAllowBrowser: true,
    })

    // Create completion with NVIDIA Nemotron 9B model
    const completion = await client.chat.completions.create({
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
    })

    const latexCode = completion.choices[0]?.message?.content || ""

    return Response.json({ latex: latexCode.trim() })
  } catch (error) {
    console.error("[v0] LaTeX Conversion Error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to convert to LaTeX" },
      { status: 500 },
    )
  }
}
