"use client";

import { ArrowRight, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generatePhase2Question, savePhase2Answer } from "@/app/lab/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface EventItem {
  idx: number; // Original index from Phase 1
  original_text: string;
  category: string;
  missing_info?: string[];
  project_id?: string;
  new_project_name?: string;
}

interface Phase2ChatProps {
  runId: string;
  targetEvents: EventItem[]; // filtered events (needs_context)
  onComplete: () => void;
}

export function Phase2Chat({
  runId,
  targetEvents,
  onComplete,
}: Phase2ChatProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // State for current step
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentEvent = targetEvents[currentIndex];
  const isLast = currentIndex === targetEvents.length - 1;

  // 1. Generate Question
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generatePhase2Question(runId, currentEvent);
      if (res.success && res.question) {
        setQuestion(res.question);
      } else {
        toast.error("질문 생성 실패", { description: res.error });
      }
    } catch (_e) {
      toast.error("통신 에러");
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Save Answer & Next
  const handleNext = async () => {
    if (!answer.trim()) return toast.warning("답변을 입력해주세요.");

    setIsSaving(true);
    try {
      if (!question) return; // Guard
      const res = await savePhase2Answer(
        runId,
        currentEvent.idx,
        question,
        answer,
      );
      if (res.success) {
        toast.success("답변 저장 완료");

        // Move to next or complete
        if (isLast) {
          onComplete();
        } else {
          setCurrentIndex((prev) => prev + 1);
          // Reset for next
          setQuestion(null);
          setAnswer("");
        }
      } else {
        toast.error("저장 실패", { description: res.error });
      }
    } catch (_e) {
      toast.error("통신 에러");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentEvent) {
    return (
      <div className="p-8 text-center border rounded-lg bg-green-50">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-green-900">모든 질문 완료</h3>
        <p className="text-green-700">Phase 2 인터뷰가 끝났습니다.</p>
        <Button className="mt-4" onClick={onComplete}>
          다음 단계로 (Auto Decision)
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-blue-200 shadow-sm">
      <CardHeader className="bg-blue-50/50 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Phase 2 Interview ({currentIndex + 1} / {targetEvents.length})
          </CardTitle>
          <Badge variant="secondary">Event #{currentEvent.idx}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Original Text Context */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Original Context
          </h4>
          <div className="p-3 bg-muted rounded-md text-sm border">
            {currentEvent.original_text}
          </div>
          {currentEvent.missing_info && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              <strong>Missing Info:</strong>{" "}
              {currentEvent.missing_info.join(", ")}
            </div>
          )}
        </div>

        {/* Question Section */}
        <div className="space-y-3">
          {!question ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-slate-50">
              <p className="text-sm text-muted-foreground mb-4">
                이 이벤트는 추가 정보가 필요합니다.
                <br />
                AI에게 맥락을 파악하기 위한 질문을 요청하세요.
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                질문 생성하기 (AI)
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              <div className="p-4 bg-blue-100/50 rounded-lg border border-blue-100 text-blue-900 font-medium">
                Q. {question}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="answer-input"
                  className="text-xs font-bold text-slate-700"
                >
                  Your Answer
                </label>
                <Textarea
                  id="answer-input"
                  placeholder="답변을 입력하세요..."
                  className="min-h-[100px] bg-white text-base"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {question && (
        <CardFooter className="justify-end border-t pt-4 bg-slate-50/30">
          <Button onClick={handleNext} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLast ? "저장 및 완료" : "저장 후 다음 질문"}
            {!isSaving && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
