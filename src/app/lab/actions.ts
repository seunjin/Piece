"use server";

import { revalidatePath } from "next/cache";
import { orchestrator } from "@/lib/ai/orchestrator";
import { createClient } from "@/utils/supabase/server";

/**
 * 테스트 실행 요청 데이터 인터페이스
 */
interface RunTestOptions {
  sampleId?: string;
  customInput?: {
    title?: string;
    job_title: string;
    raw_input: string;
    saveToLibrary?: boolean;
  };
  promptVersions: {
    phase1: string;
    phase2: string;
    phase3: string;
  };
}

/**
 * 새로운 테스트 샘플을 생성합니다.
 */
export async function createSample(data: {
  title: string;
  job_title: string;
  raw_input: string;
}) {
  const supabase = await createClient();

  try {
    const { data: sample, error } = await supabase
      .from("ai_test_samples")
      .insert({
        title: data.title,
        job_title: data.job_title,
        raw_input: data.raw_input,
      })
      .select()
      .single();

    if (error) throw error;

    // 리스트 갱신을 위해 페이지 revalidate
    revalidatePath("/lab/new");
    return { success: true, sample };
  } catch (error: any) {
    console.error("createSample Action 에러:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 테스트를 시작하고 Phase 1을 실행합니다.
 */
export async function runTest(options: RunTestOptions) {
  const supabase = await createClient();
  console.log("runTest Called with options:", JSON.stringify(options, null, 2));
  try {
    let finalSampleId = options.sampleId;
    let runInput = options.customInput?.raw_input;
    let runJobTitle = options.customInput?.job_title;

    // 1. 샘플 ID가 있으면 DB에서 조회하여 snapshot용 데이터 확보
    if (finalSampleId) {
      const { data: sample } = await supabase
        .from("ai_test_samples")
        .select("*")
        .eq("id", finalSampleId)
        .single();
      if (sample) {
        runInput = sample.raw_input;
        runJobTitle = sample.job_title || "Developer";
      }
    }

    // 2. Custom Input + Save to Library인 경우 샘플 생성
    if (!finalSampleId && options.customInput?.saveToLibrary) {
      const { data: newSample, error: createError } = await supabase
        .from("ai_test_samples")
        .insert({
          title:
            options.customInput.title ||
            `[${options.customInput.job_title}] Sample ${new Date().toISOString()}`,
          job_title: options.customInput.job_title,
          raw_input: options.customInput.raw_input,
        })
        .select()
        .single();

      if (createError)
        throw new Error(`샘플 저장 실패: ${createError.message}`);
      finalSampleId = newSample.id;
    }

    // 3. Run 레코드 생성 (Snapshot 포함)
    const { data: run, error: runError } = await supabase
      .from("ai_test_runs")
      .insert({
        sample_id: finalSampleId || null,
        raw_input: runInput,
        job_title: runJobTitle,
        phase1_version_id: options.promptVersions.phase1,
        phase2_version_id: options.promptVersions.phase2,
        phase3_version_id: options.promptVersions.phase3,
        status: "running",
        total_cost_usd: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
      })
      .select()
      .single();

    if (runError || !run) {
      throw new Error(
        `Run 레코드 생성 실패: ${runError?.message || "No data returned"}`,
      );
    }

    // 4. Orchestrator Phase 1 비동기 실행
    await orchestrator.runPhase1(run.id);

    // 5. 페이지 갱신
    revalidatePath("/lab");

    return { success: true, runId: run.id };
  } catch (error: any) {
    console.error("runTest Action 에러 상세:", JSON.stringify(error, null, 2));
    return { success: false, error: error.message || "Unknown error" };
  }
}

// TODO: Phase 2, Phase 3를 위한 추가 Server Action 구현 필요
// export async function runPhase2Action(runId: string, targetEvents: any[]) { ... }

/**
 * Phase 1 결과에 대한 사용자 수정 사항을 저장합니다.
 */
export async function submitPhase1Edits(runId: string, events: any[]) {
  const supabase = await createClient();

  try {
    // 1. 수정된 결과를 'phase1_corrected' 페이즈로 저장
    await supabase.from("ai_test_run_results").insert({
      run_id: runId,
      phase: "phase1_corrected",
      model: "user-feedback",
      input_payload: { source: "user_edit" },
      output_payload: { events }, // 수정된 이벤트 리스트
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: 0,
    });

    // 2. Run 상태 업데이트 (필요하다면)
    // 현재는 Result 존재 여부로 UI를 제어할 것이므로 필수 아님

    revalidatePath(`/lab/runs/${runId}`);
    return { success: true };
  } catch (error: any) {
    console.error("submitPhase1Edits Action 에러:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 새로운 프로젝트를 생성을 위한 Server Action
 */
export async function createProject(name: string) {
  const supabase = await createClient();

  try {
    // projects table definition missing in types, using any cast
    const { data: project, error } = await supabase
      .from("projects")
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    return { success: true, project };
  } catch (error: any) {
    console.error("createProject Action 에러:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Phase 2 question generation logic
 */
export async function generatePhase2Question(runId: string, eventContext: any) {
  try {
    const result = await orchestrator.runPhase2Single(runId, eventContext);
    // Result is already saved in DB by orchestrator
    return { success: true, question: result.question };
  } catch (error: any) {
    console.error("Phase 2 Question Gen Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Phase 2 answer submission
 */
export async function savePhase2Answer(
  runId: string,
  eventIdx: number,
  question: string,
  answer: string,
) {
  const supabase = await createClient();
  try {
    // Save answer as a result record
    await supabase.from("ai_test_run_results").insert({
      run_id: runId,
      phase: "phase2_answer",
      model: "user",
      input_payload: { question, event_idx: eventIdx },
      output_payload: { answer },
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: 0,
    });

    revalidatePath(`/lab/runs/${runId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Phase 2 Answer Save Error:", error);
    return { success: false, error: error.message };
  }
}
