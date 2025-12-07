"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Phase2Chat } from "./phase2-chat";

interface Phase2ContainerProps {
  runId: string;
  // biome-ignore lint/suspicious/noExplicitAny: DB payload structure is dynamic
  phase1Events: any[];
}

export function Phase2Container({ runId, phase1Events }: Phase2ContainerProps) {
  // Filter for needs_context
  // @ts-expect-error
  const targetEvents = phase1Events.filter(
    (e) => e.category === "needs_context",
  );
  const router = useRouter();

  if (targetEvents.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
        Phase 2 skipped: No events require context probing. Ready for Phase 3.
      </div>
    );
  }

  const handleComplete = () => {
    toast.success("All Phase 2 questions completed!");
    // Refresh to potentially show Phase 3 or update status
    router.refresh();
  };

  return (
    <Phase2Chat
      runId={runId}
      targetEvents={targetEvents}
      onComplete={handleComplete}
    />
  );
}
