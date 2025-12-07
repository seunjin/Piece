import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { z } from "zod";

export type AIModel = "gpt-4o-mini" | "gpt-4o";

/**
 * AI 클라이언트 응답 타입
 * - object: 생성된 구조화 데이터
 * - usage: 토큰 사용량 정보
 */
export interface AIClientResponse<T> {
  object: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const aiClient = {
  /**
   * 구조화된 데이터를 생성합니다 (generateObject).
   * 주어진 스키마(Zod)에 맞춰 AI가 JSON 데이터를 반환합니다.
   *
   * @param params - 생성 요청 파라미터
   * @param params.model - 사용할 모델 ("gpt-4o-mini" | "gpt-4o")
   * @param params.schema - Zod 스키마
   * @param params.system - 시스템 프롬프트
   * @param params.prompt - 사용자 프롬프트
   * @param params.temperature - 생성 온도 (기본값: 0)
   * @returns 생성된 객체와 토큰 사용량
   */
  async generateStructured<T>({
    model = "gpt-4o-mini",
    schema,
    system,
    prompt,
    temperature = 0,
  }: {
    model?: AIModel;
    schema: z.ZodType<T>;
    system?: string;
    prompt: string;
    temperature?: number;
  }): Promise<AIClientResponse<T>> {
    const result = await generateObject({
      model: openai(model),
      schema,
      system,
      prompt,
      temperature,
    });

    // Vercel AI SDK v5의 usage 타입을 안전하게 변환
    const usage = result.usage || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    return {
      object: result.object,
      usage: {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
      },
    };
  },
};
