import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { aiClient } from "./client";

// --- Schemas & Types ---

/**
 * Phase 1 Output Schema
 * - Raw Input을 분해하고 분류한 결과
 */
export const phase1Schema = z.object({
  events: z.array(
    z.object({
      idx: z.number(),
      original_text: z.string(),
      category: z.enum([
        "achievement_ready",
        "needs_context",
        "not_achievement",
      ]),
      missing_info: z.array(z.string()).optional(),
      is_seed_candidate: z.boolean(),
    }),
  ),
});
export type Phase1Output = z.infer<typeof phase1Schema>;

/**
 * Phase 2 Output Schema (Single Question)
 */
export const phase2Schema = z.object({
  question: z.string(),
});
export type Phase2Output = z.infer<typeof phase2Schema>;

/**
 * Auto Decision Schema
 * - Event 상태 자동 결정
 */
export const decisionSchema = z.object({
  event_status: z.enum(["to_outcome", "to_seed", "discard"]),
  confidence: z.number(),
  reason: z.string().optional(),
});
export type DecisionOutput = z.infer<typeof decisionSchema>;

/**
 * Phase 3 Output Schema (PACRI)
 */
export const phase3Schema = z.object({
  pacri: z.object({
    problem: z.string(),
    approach: z.string(),
    contribution: z.string(),
    result: z.string(),
    impact: z.string(),
  }),
  title: z.string(),
  skill_tags: z.array(z.string()),
  quality_score: z.number(),
});
export type Phase3Output = z.infer<typeof phase3Schema>;

// --- Orchestrator Implementation ---

/**
 * AI 테스트 오케스트레이터 (Interactive Ver.)
 *
 * 이제 각 단계(Phase)를 개별적으로 호출할 수 있습니다.
 * Interactive Flow:
 * 1. runPhase1(runId) -> Result Save
 * 2. (User Edit) -> Client Action
 * 3. runPhase2(runId, targetEvents) -> Context Probing Loop
 * 4. decideEventStatus(runId, eventCtx) -> Auto Decision
 * 5. runPhase3(runId, approvedEvents) -> PACRI Gen
 */
export const orchestrator = {
  /**
   * Phase 1: Event Split & Classification
   */
  async runPhase1(runId: string) {
    const supabase = await createClient();

    // 1. Run 정보 조회
    const { data: run, error } = await supabase
      .from("ai_test_runs")
      .select(`
        *,
        sample:ai_test_samples(raw_input, job_title),
        phase1_version:phase1_version_id(*)
      `)
      .eq("id", runId)
      .single();

    if (error || !run) throw new Error("Run not found");

    try {
      // Input priority: Run Snapshot > Sample Reference
      // @ts-expect-error (Supabase types might not be fully updated in IDE yet)
      const rawInput = run.raw_input || run.sample?.raw_input;
      // @ts-expect-error
      const jobTitle = run.job_title || run.sample?.job_title || "Developer";

      if (!rawInput) {
        throw new Error("No input text found for this run.");
      }

      const p1Input = {
        text: rawInput,
        job_title: jobTitle,
      };

      let p1SystemPrompt = `You are a career log analyst. Split the text into events and classify them.`;

      // 파일에서 프롬프트 로드
      if (run.phase1_version?.file_path) {
        try {
          const fs = await import("fs/promises");
          const path = await import("path");
          const distinctPath = path.join(
            process.cwd(),
            run.phase1_version.file_path,
          );
          p1SystemPrompt = await fs.readFile(distinctPath, "utf-8");
        } catch (e) {
          console.warn("[Orchestrator] Phase 1 Prompt File Load Failed:", e);
        }
      }

      const p1Result = await aiClient.generateStructured({
        model: "gpt-4o-mini",
        schema: phase1Schema,
        system: p1SystemPrompt,
        prompt: JSON.stringify(p1Input),
      });

      // 결과 저장
      await supabase.from("ai_test_run_results").insert({
        run_id: runId,
        phase: "phase1",
        model: "gpt-4o-mini",
        prompt_version_id: run.phase1_version_id,
        input_payload: p1Input,
        output_payload: p1Result.object,
        input_tokens: p1Result.usage.promptTokens,
        output_tokens: p1Result.usage.completionTokens,
        cost_usd: 0, // TODO: Token cost calc
      });

      return { success: true, data: p1Result.object };
    } catch (err: any) {
      console.error("[Orchestrator] Phase 1 Error:", err);
      throw err;
    }
  },

  /**
   * Phase 2: Context Probing (Single Event)
   * - 특정 이벤트 하나에 대해 질문을 생성합니다.
   */
  async runPhase2Single(runId: string, eventContext: any) {
    const supabase = await createClient();

    // Run 정보 (Prompt Version) 조회
    const { data: run } = await supabase
      .from("ai_test_runs")
      .select(
        "phase2_version_id, phase2_version:phase2_version_id(*), sample:ai_test_samples(job_title)",
      )
      .eq("id", runId)
      .single();

    if (!run) throw new Error("Run not found");

    const p2Input = {
      user_input: eventContext.original_text,
      missing_info: eventContext.missing_info,
      job_title: run.sample?.job_title,
    };

    let p2SystemPrompt = "Generate a probing question.";
    // 파일 로드 로직 (Phase 2)
    if (run.phase2_version?.file_path) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const distinctPath = path.join(
          process.cwd(),
          run.phase2_version.file_path,
        );
        p2SystemPrompt = await fs.readFile(distinctPath, "utf-8");
      } catch (e) {
        console.warn("Phase 2 Prompt load failed", e);
      }
    }

    const p2Result = await aiClient.generateStructured({
      model: "gpt-4o-mini",
      schema: phase2Schema,
      system: p2SystemPrompt,
      prompt: JSON.stringify(p2Input),
    });

    // 결과 저장 (개별 질문 건마다 저장할지, 나중에 몰아서 할지는 정책 나름이나, 여기선 건별 저장)
    await supabase.from("ai_test_run_results").insert({
      run_id: runId,
      phase: "phase2",
      model: "gpt-4o-mini",
      prompt_version_id: run.phase2_version_id,
      input_payload: p2Input, // 어떤 이벤트에 대한 질문인지 식별 필요 (event_idx 등)
      output_payload: { ...p2Result.object, event_idx: eventContext.idx }, // 결과에 idx 포함 권장
      input_tokens: p2Result.usage.promptTokens,
      output_tokens: p2Result.usage.completionTokens,
    });

    return p2Result.object;
  },

  /**
   * Auto Decision: Determine Status (To Outcome / To Seed / Discard)
   */
  async determineStatus(runId: string, eventContext: any) {
    // 룰 베이스 + AI 판단 하이브리드 가능
    // 여기서는 간단히 AI 판단으로 구현

    const input = {
      text: eventContext.original_text,
      category: eventContext.category,
      answers: eventContext.answers || [], // Phase 2 답변들
    };

    const result = await aiClient.generateStructured({
      model: "gpt-4o-mini",
      schema: decisionSchema,
      system:
        "Determine if this event should be an Outcome, Seed, or Discarded based on completeness and value.",
      prompt: JSON.stringify(input),
    });

    return result.object;
  },

  /**
   * Phase 3: PACRI Generation
   */
  async runPhase3Single(runId: string, eventContext: any) {
    const supabase = await createClient();

    const { data: run } = await supabase
      .from("ai_test_runs")
      .select(
        "phase3_version_id, phase3_version:phase3_version_id(*), sample:ai_test_samples(job_title)",
      )
      .eq("id", runId)
      .single();

    if (!run) throw new Error("Run not found");

    let p3SystemPrompt = "Transform into PACRI format.";
    if (run.phase3_version?.file_path) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const distinctPath = path.join(
          process.cwd(),
          run.phase3_version.file_path,
        );
        p3SystemPrompt = await fs.readFile(distinctPath, "utf-8");
      } catch (e) {
        console.warn("Phase 3 Prompt load failed", e);
      }
    }

    const p3Input = {
      combined_text: eventContext.original_text,
      answers: eventContext.answers,
      job_title: run.sample?.job_title,
    };

    const p3Result = await aiClient.generateStructured({
      model: "gpt-4o", // Phase 3는 고성능 모델
      schema: phase3Schema,
      system: p3SystemPrompt,
      prompt: JSON.stringify(p3Input),
    });

    // 결과 저장
    await supabase.from("ai_test_run_results").insert({
      run_id: runId,
      phase: "phase3",
      model: "gpt-4o",
      prompt_version_id: run.phase3_version_id,
      input_payload: { ...p3Input, event_idx: eventContext.idx },
      output_payload: { ...p3Result.object, event_idx: eventContext.idx },
      input_tokens: p3Result.usage.promptTokens,
      output_tokens: p3Result.usage.completionTokens,
    });

    return p3Result.object;
  },
};
