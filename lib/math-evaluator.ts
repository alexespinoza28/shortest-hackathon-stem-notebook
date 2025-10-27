type EvaluationSuccess = {
  success: true
  value: number
  displayValue: string
}

type EvaluationFailure = {
  success: false
  error: string
}

export type EvaluationResult = EvaluationSuccess | EvaluationFailure

const FUNCTION_MAP: Record<string, (x: number) => number> = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  asin: (x) => Math.asin(x),
  acos: (x) => Math.acos(x),
  atan: (x) => Math.atan(x),
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  sqrt: (x) => Math.sqrt(x),
  abs: (x) => Math.abs(x),
  ln: (x) => Math.log(x),
  log: (x) => Math.log(x),
  log10: (x) => Math.log10(x),
  exp: (x) => Math.exp(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  round: (x) => Math.round(x),
  sign: (x) => Math.sign(x),
}

const FUNCTION_ALIASES: Record<string, string> = {
  sine: "sin",
  cosine: "cos",
  tangent: "tan",
  arcsin: "asin",
  arccos: "acos",
  arctan: "atan",
  arctangent: "atan",
  logarithm: "log",
  log10: "log10",
  sqr: "sqrt",
  squareroot: "sqrt",
}

const CONSTANT_MAP: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  tau: Math.PI * 2,
  τ: Math.PI * 2,
  e: Math.E,
}

type Token =
  | { type: "number"; value: number }
  | { type: "operator"; value: "+" | "-" | "*" | "/" | "^" | "u-" }
  | { type: "function"; name: string }
  | { type: "leftParen" }
  | { type: "rightParen" }

const isLetter = (char: string) => /[a-zA-Zα-ωΑ-Ω]/.test(char)
const isDigit = (char: string) => /[0-9]/.test(char)

function tokenize(expression: string): Token[] | EvaluationFailure {
  const tokens: Token[] = []
  let i = 0
  let lastTokenType: Token["type"] | "operator" | null = null

  while (i < expression.length) {
    const char = expression[i]

    if (char === " " || char === "\t" || char === "\n") {
      i++
      continue
    }

    if (isDigit(char) || char === ".") {
      let numStr = char
      i++
      while (i < expression.length && (isDigit(expression[i]) || expression[i] === ".")) {
        numStr += expression[i]
        i++
      }
      const value = Number(numStr)
      if (Number.isNaN(value)) {
        return { success: false, error: `Invalid number "${numStr}"` }
      }
      tokens.push({ type: "number", value })
      lastTokenType = "number"
      continue
    }

    if (isLetter(char) || CONSTANT_MAP[char] !== undefined) {
      let identifier = char
      i++
      while (i < expression.length && /[a-zA-Z0-9_πτ]/.test(expression[i])) {
        identifier += expression[i]
        i++
      }

      const lower = identifier.toLowerCase()

      if (CONSTANT_MAP[identifier] !== undefined || CONSTANT_MAP[lower] !== undefined) {
        const constantValue =
          CONSTANT_MAP[identifier] ?? CONSTANT_MAP[lower]
        tokens.push({ type: "number", value: constantValue })
        lastTokenType = "number"
        continue
      }

      const canonical = FUNCTION_ALIASES[lower] ?? lower
      if (FUNCTION_MAP[canonical]) {
        tokens.push({ type: "function", name: canonical })
        lastTokenType = "function"
        continue
      }

      return { success: false, error: `Unknown identifier "${identifier}"` }
    }

    if (char === "(") {
      tokens.push({ type: "leftParen" })
      lastTokenType = "leftParen"
      i++
      continue
    }

    if (char === ")") {
      tokens.push({ type: "rightParen" })
      lastTokenType = "rightParen"
      i++
      continue
    }

    if (char === "+" || char === "-" || char === "*" || char === "/" || char === "^") {
      let operatorValue: Token["value"] = char as Token["value"]
      if (
        char === "-" &&
        (lastTokenType === null ||
          lastTokenType === "operator" ||
          lastTokenType === "leftParen" ||
          lastTokenType === "function")
      ) {
        operatorValue = "u-"
      }
      tokens.push({ type: "operator", value: operatorValue })
      lastTokenType = "operator"
      i++
      continue
    }

    return { success: false, error: `Unsupported character "${char}"` }
  }

  return tokens
}

function shuntingYard(tokens: Token[]): Token[] | EvaluationFailure {
  const output: Token[] = []
  const stack: Token[] = []

  const precedence: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 3,
    "u-": 4,
  }

  const rightAssociative = new Set<"^" | "u-">(["^", "u-"])

  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token)
    } else if (token.type === "function") {
      stack.push(token)
    } else if (token.type === "operator") {
      while (stack.length > 0) {
        const top = stack[stack.length - 1]
        if (top.type === "operator") {
          const topPrecedence = precedence[top.value]
          const currentPrecedence = precedence[token.value]
          if (
            topPrecedence > currentPrecedence ||
            (topPrecedence === currentPrecedence && !rightAssociative.has(token.value))
          ) {
            output.push(stack.pop()!)
            continue
          }
        } else if (top.type === "function") {
          output.push(stack.pop()!)
          continue
        }
        break
      }
      stack.push(token)
    } else if (token.type === "leftParen") {
      stack.push(token)
    } else if (token.type === "rightParen") {
      let foundLeftParen = false
      while (stack.length > 0) {
        const top = stack.pop()!
        if (top.type === "leftParen") {
          foundLeftParen = true
          break
        }
        output.push(top)
      }
      if (!foundLeftParen) {
        return { success: false, error: "Mismatched parentheses" }
      }
      const next = stack[stack.length - 1]
      if (next?.type === "function") {
        output.push(stack.pop()!)
      }
    }
  }

  while (stack.length > 0) {
    const token = stack.pop()!
    if (token.type === "leftParen" || token.type === "rightParen") {
      return { success: false, error: "Mismatched parentheses" }
    }
    output.push(token)
  }

  return output
}

function evaluateRpn(tokens: Token[]): EvaluationResult {
  const stack: number[] = []

  for (const token of tokens) {
    if (token.type === "number") {
      stack.push(token.value)
    } else if (token.type === "operator") {
      if (token.value === "u-") {
        const operand = stack.pop()
        if (operand === undefined) {
          return { success: false, error: "Invalid unary operation" }
        }
        stack.push(-operand)
      } else {
        const right = stack.pop()
        const left = stack.pop()
        if (left === undefined || right === undefined) {
          return { success: false, error: "Invalid binary operation" }
        }
        switch (token.value) {
          case "+":
            stack.push(left + right)
            break
          case "-":
            stack.push(left - right)
            break
          case "*":
            stack.push(left * right)
            break
          case "/":
            stack.push(left / right)
            break
          case "^":
            stack.push(left ** right)
            break
        }
      }
    } else if (token.type === "function") {
      const operand = stack.pop()
      if (operand === undefined) {
        return { success: false, error: `Missing value for ${token.name}` }
      }
      const fn = FUNCTION_MAP[token.name]
      if (!fn) {
        return { success: false, error: `Unsupported function "${token.name}"` }
      }
      stack.push(fn(operand))
    }
  }

  if (stack.length !== 1) {
    return { success: false, error: "Unable to resolve expression" }
  }

  const value = stack[0]
  if (!Number.isFinite(value)) {
    return { success: false, error: "Expression evaluates to an infinite result" }
  }

  const rounded = Math.abs(value) < 1e-10 ? 0 : value
  const displayValue = Number.parseFloat(rounded.toFixed(10)).toString()

  return {
    success: true,
    value,
    displayValue,
  }
}

export function evaluateMathExpression(rawExpression: string): EvaluationResult {
  const expression = rawExpression.trim()
  if (!expression) {
    return { success: false, error: "No expression to evaluate." }
  }

  const tokenized = tokenize(expression)
  if (!Array.isArray(tokenized)) {
    return tokenized
  }

  const rpn = shuntingYard(tokenized)
  if (!Array.isArray(rpn)) {
    return rpn
  }

  return evaluateRpn(rpn)
}
