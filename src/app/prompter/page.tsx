"use client"

import Image from "next/image"
import localFont from "next/font/local"
import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Copy } from "lucide-react"

const forum = localFont({
  src: "../../fonts/Forum-Regular.ttf",
  display: "swap",
})

type ChatRole = "user" | "assistant"
type ChatMessage = { role: ChatRole; content: string }

interface PromptDraft {
  task: string
  context: string
  constraints: string
  extra: string
}

const SYSTEM_PROMPT = `You are an expert prompt engineer. Your job is to take a user's raw task and turn it into a precise, well-structured prompt they can paste directly into an LLM to get an excellent result on the first try.

When the user describes their task, don't respond with a prompt yet. Instead, identify the 2–3 most important unknowns that would make the biggest difference to prompt quality — things like audience, format, tone, constraints, or the specific outcome they care about.

Then follow this exact workflow:

1. User describes their task → you ask only your first question (nothing else)
2. User answers → you ask only your second question (nothing else)
3. User answers → you ask your third and final question, if needed. If you already have everything, skip to step 4.
4. User answers → you output the final prompt only, with no explanation or commentary

The final output is a ready-to-use prompt written in second person ("You are...", "Your task is..."), not a meta-description of what the prompt should do. It should be specific, direct, and front-loaded with the most important context.

Never ask more than 3 follow-up questions total. Never explain your reasoning between steps. Never output anything other than a single question (steps 1–3) or the final prompt (step 4).

Detect the language the user is writing in from their answers and output the final prompt in that same language.`


const TASK_STEP = {
  question: "Что нужно сделать?",
  placeholder: "Например: подготовить структуру лендинга для нового продукта",
}

export default function PrompterPage() {
  // 0 -> task
  // 1 -> answer to AI first question
  // 2 -> answer to AI second question
  // 3 -> answer to AI third question (optional)
  // 4 -> final prompt
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<PromptDraft>({
    task: "",
    context: "",
    constraints: "",
    extra: "",
  })

  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null)
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const [isCopyHover, setIsCopyHover] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPreviewStep = stepIndex === 4

  const currentValue = useMemo(() => {
    if (stepIndex === 0) return draft.task
    if (stepIndex === 1) return draft.context
    if (stepIndex === 2) return draft.constraints
    if (stepIndex === 3) return draft.extra
    return ""
  }, [draft, stepIndex])

  const currentStepQuestion = useMemo(() => {
    if (stepIndex === 0) return TASK_STEP.question
    if (stepIndex === 1) return aiQuestions[0] || "Ожидаем вопрос от ИИ..."
    if (stepIndex === 2) return aiQuestions[1] || "Ожидаем вопрос от ИИ..."
    if (stepIndex === 3) return aiQuestions[2] || "Ожидаем вопрос от ИИ..."
    return ""
  }, [aiQuestions, stepIndex])

  const currentStepPlaceholder = useMemo(() => {
    if (stepIndex === 0) return TASK_STEP.placeholder
    if (stepIndex === 1) return "Ответьте на первый вопрос ИИ..."
    if (stepIndex === 2) return "Ответьте на второй вопрос ИИ..."
    if (stepIndex === 3) return "Ответьте на третий вопрос ИИ..."
    return ""
  }, [stepIndex])

  const canGoNext = useMemo(() => {
    if (isPreviewStep) return true
    if (isLoading) return false
    if (stepIndex === 0) return draft.task.trim().length > 0
    if (stepIndex === 1) return draft.context.trim().length > 0
    if (stepIndex === 2) return draft.constraints.trim().length > 0
    if (stepIndex === 3) return draft.extra.trim().length > 0
    return false
  }, [draft, isLoading, isPreviewStep, stepIndex])

  const updateCurrent = (value: string) => {
    if (stepIndex === 0) setDraft((prev) => ({ ...prev, task: value }))
    if (stepIndex === 1) setDraft((prev) => ({ ...prev, context: value }))
    if (stepIndex === 2) setDraft((prev) => ({ ...prev, constraints: value }))
    if (stepIndex === 3) setDraft((prev) => ({ ...prev, extra: value }))
  }

  const looksLikeFinalPrompt = (text: string) => {
    const t = text.trim()
    // The system prompt forces the final output to be in English second person:
    // "You are ..." / "Your task is ..."
    if (/\?\s*$/.test(t)) return false
    return /^(You are|Your task is)\b/i.test(t) || /^(Ты|Твоя|Тебе|Ваша|Вам)\b/i.test(t)
  }

  const callDeepseek = async (messages: Array<{ role: ChatRole | "system"; content: string }>) => {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.7,
        messages,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.details || err?.error || `API error: ${res.status}`)
    }

    const data = await res.json()
    return String(data?.response ?? "")
  }

  const handleBack = () => {
    if (isLoading || stepIndex === 0) return
    setError(null)

    if (stepIndex === 1) {
      setStepIndex(0)
      setAiQuestions([])
      setFinalPrompt(null)
      setHistory([])
      setDraft((prev) => ({ ...prev, context: "", constraints: "", extra: "" }))
      return
    }

    if (stepIndex === 2) {
      setStepIndex(1)
      setAiQuestions((prev) => prev.slice(0, 1))
      setFinalPrompt(null)
      // Remove the last AI question (question #2) so we can re-answer it.
      setHistory((prev) => prev.slice(0, Math.max(0, prev.length - 1)))
      setDraft((prev) => ({ ...prev, constraints: "", extra: "" }))
      return
    }

    if (stepIndex === 3) {
      setStepIndex(2)
      setAiQuestions((prev) => prev.slice(0, 2))
      setFinalPrompt(null)
      // Remove the last AI question (question #3) so we can re-answer it.
      setHistory((prev) => prev.slice(0, Math.max(0, prev.length - 1)))
      setDraft((prev) => ({ ...prev, extra: "" }))
      return
    }

    if (stepIndex === 4) {
      const targetStep = Math.max(0, Math.min(3, aiQuestions.length))
      setStepIndex(targetStep)
      setFinalPrompt(null)
      return
    }
  }

  const handleNext = async () => {
    if (!canGoNext) return
    setError(null)
    setIsLoading(true)

    try {
      if (stepIndex === 0) {
        const userTaskMessage = `ЗАДАЧА ПОЛЬЗОВАТЕЛЯ:\n${draft.task.trim()}`
        const messages = [
          { role: "system" as const, content: SYSTEM_PROMPT },
          { role: "user" as const, content: userTaskMessage },
        ]

        const aiText = (await callDeepseek(messages)).trim()
        if (!aiText) throw new Error("Пустой ответ от ИИ")

        setAiQuestions([aiText])
        setHistory([
          { role: "user", content: userTaskMessage },
          { role: "assistant", content: aiText },
        ])
        setStepIndex(1)
        return
      }

      if (stepIndex === 1) {
        const answer1 = draft.context.trim()
        const messages = [
          { role: "system" as const, content: SYSTEM_PROMPT },
          ...history,
          { role: "user" as const, content: answer1 },
        ]

        const aiText = (await callDeepseek(messages)).trim()
        if (!aiText) throw new Error("Пустой ответ от ИИ")

        if (looksLikeFinalPrompt(aiText)) {
          setIsCopied(false)
          setFinalPrompt(aiText)
          setStepIndex(4)
          return
        }

        setAiQuestions((prev) => [prev[0] || "", aiText].filter(Boolean))
        setHistory((prev) => [...prev, { role: "user", content: answer1 }, { role: "assistant", content: aiText }])
        setStepIndex(2)
        return
      }

      if (stepIndex === 2) {
        const answer2 = draft.constraints.trim()
        const messages = [
          { role: "system" as const, content: SYSTEM_PROMPT },
          ...history,
          { role: "user" as const, content: answer2 },
        ]

        const aiText = (await callDeepseek(messages)).trim()
        if (!aiText) throw new Error("Пустой ответ от ИИ")

        if (looksLikeFinalPrompt(aiText)) {
          setIsCopied(false)
          setFinalPrompt(aiText)
          setStepIndex(4)
          return
        }

        setAiQuestions((prev) => [...prev, aiText])
        setHistory((prev) => [...prev, { role: "user", content: answer2 }, { role: "assistant", content: aiText }])
        setStepIndex(3)
        return
      }

      if (stepIndex === 3) {
        const answer3 = draft.extra.trim()
        const messages = [
          { role: "system" as const, content: SYSTEM_PROMPT },
          ...history,
          { role: "user" as const, content: answer3 },
        ]

        const aiText = (await callDeepseek(messages)).trim()
        if (!aiText) throw new Error("Пустой ответ от ИИ")

        setIsCopied(false)
        setFinalPrompt(aiText)
        setStepIndex(4)
        return
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса к ИИ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyFinalPrompt = async () => {
    if (!finalPrompt) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(finalPrompt)
      } else {
        // Fallback for older browsers.
        const textarea = document.createElement("textarea")
        textarea.value = finalPrompt
        textarea.setAttribute("readonly", "true")
        textarea.style.position = "fixed"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        const ok = document.execCommand("copy")
        document.body.removeChild(textarea)
        if (!ok) throw new Error("Copy command failed")
      }

      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 750)
    } catch {
      setError("Не удалось скопировать. Попробуйте ещё раз.")
    }
  }

  const copyTooltipText = isCopied ? "Скопировано" : isCopyHover ? "Скопировать" : null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7F4", color: "#171717" }}>
      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{
          borderColor: "#e6e6e1",
          backgroundColor: "rgba(247,247,244,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="flex items-center space-x-2">
            <Image src="/transformer-logo.svg" alt="Промптер" width={24} height={24} className="object-contain" />
            <h1 className="text-[19px] font-semibold" style={{ color: "#171717" }}>
              Промптер
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em]" style={{ color: "#7a7a74" }}>
              transfrmr / prompter
            </p>
            <h2
              className={`${forum.className} text-3xl font-normal tracking-tight md:text-[39px]`}
              style={{ color: "#171717" }}
            >
              Сильный промпт за 3 шага
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm md:text-base" style={{ color: "#5f5f59" }}>
              ИИ задаст 3 уточняющих вопроса и соберет готовый промпт, который можно сразу вставлять в LLM
            </p>
          </div>

          <section
            className="rounded-3xl border p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] md:p-7"
            style={{ borderColor: "#e3e3de", backgroundColor: "#fbfbf9" }}
          >
            {!isPreviewStep ? (
              <div className="space-y-4">
                <div
                  className="max-w-[85%] rounded-2xl border px-4 py-3 text-sm md:text-base"
                  style={{ borderColor: "#e0e0db", color: "#000000" }}
                >
                  {currentStepQuestion}
                </div>

                <textarea
                  value={currentValue}
                  onChange={(e) => updateCurrent(e.target.value)}
                  placeholder={currentStepPlaceholder}
                  disabled={isLoading}
                  className="min-h-36 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none transition md:text-base"
                  style={{ borderColor: "#d8d8d2", color: "#171717", backgroundColor: "#f7f7f4" }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleCopyFinalPrompt}
                    onMouseEnter={() => setIsCopyHover(true)}
                    onMouseLeave={() => setIsCopyHover(false)}
                    disabled={!finalPrompt || isLoading}
                    className="absolute top-3 right-3 z-10 inline-flex items-center justify-center p-1 transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      color: isCopied ? "#16a34a" : "#252525",
                    }}
                  >
                    <Copy size={16} />
                  </button>
                  {copyTooltipText && (
                    <div
                      className="absolute top-0 right-3 z-20 -translate-y-[110%] rounded-md border px-2 py-1 text-[11px] shadow-sm"
                      style={{
                        borderColor: isCopied ? "#16a34a" : "#e0e0db",
                        color: isCopied ? "#16a34a" : "#000000",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      {copyTooltipText}
                    </div>
                  )}
                  <pre
                    className="whitespace-pre-wrap rounded-2xl border p-4 pt-10 text-sm leading-relaxed md:text-base"
                    style={{ borderColor: "#e0e0db", backgroundColor: "#fdfdfc", color: "#252525" }}
                  >
                    {finalPrompt || "Ожидаем ответ ИИ..."}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={stepIndex === 0 || isLoading}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: "#d8d8d2", color: "#3f3f3a", backgroundColor: "#f4f4f1" }}
              >
                <ArrowLeft size={14} />
                Назад
              </button>

              {!isPreviewStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-45"
                  style={{ borderColor: "#171717", color: "#f7f7f4", backgroundColor: "#171717" }}
                >
                  {stepIndex === 0 ? "Далее" : stepIndex === 1 ? "Далее" : stepIndex === 2 ? "Далее" : "Сгенерировать промпт"}
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setStepIndex(0)
                    setDraft({ task: "", context: "", constraints: "", extra: "" })
                    setAiQuestions([])
                    setFinalPrompt(null)
                    setIsCopied(false)
                    setHistory([])
                    setError(null)
                  }}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                  style={{ borderColor: "#171717", color: "#f7f7f4", backgroundColor: "#171717" }}
                >
                  Новый промпт
                </button>
              )}
            </div>

            {error && (
              <div
                className="mt-4 rounded-2xl border px-4 py-3 text-sm"
                style={{ borderColor: "#f1b2b2", backgroundColor: "#ffe9e9", color: "#6d1f1f" }}
              >
                {error}
              </div>
            )}

            {isLoading && !isPreviewStep && (
              <div className="mt-4 text-xs" style={{ color: "#6b6b64" }}>
                ИИ обрабатывает запрос...
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
