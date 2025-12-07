import Link from "next/link";
import { notFound } from "next/navigation";
import { Phase1Editor } from "@/components/lab/phase1-editor";
import { Phase2Container } from "@/components/lab/phase2-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/server";
import { RunRefreshButton } from "./run-refresh-button";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Run Details
  const { data: run } = await supabase
    .from("ai_test_runs")
    .select(`
      *,
      sample:ai_test_samples(title, raw_input),
      phase1_version:phase1_version_id(version, label),
      phase2_version:phase2_version_id(version, label),
      phase3_version:phase3_version_id(version, label)
    `)
    .eq("id", id)
    .single();

  if (!run) {
    notFound();
  }

  // 2. Fetch Results per Phase
  const { data: results } = await supabase
    .from("ai_test_run_results")
    .select("*")
    .eq("run_id", id)
    .order("created_at", { ascending: true });

  // 3. Fetch Available Projects (for Editor)
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", run.user_id || "") // Filter by user if possible, or all if null
    .order("created_at", { ascending: false });

  const phase1Result = results?.find((r) => r.phase === "phase1");
  const phase1CorrectedResult = results?.find(
    (r) => r.phase === "phase1_corrected",
  );
  const _phase2Result = results?.find((r) => r.phase === "phase2");
  const _phase3Result = results?.find((r) => r.phase === "phase3");

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Test Run Details
          </h2>
          <p className="text-muted-foreground font-mono text-sm">{run.id}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/lab">Back to List</Link>
          </Button>
          <RunRefreshButton />
        </div>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Status
            </div>
            <div className="mt-1">
              <Badge
                variant={
                  run.status === "success"
                    ? "default"
                    : run.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {run.status}
              </Badge>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Total Cost
            </div>
            <div className="mt-1 text-xl font-bold">
              ${run.total_cost_usd?.toFixed(6) || "0.000000"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Sample
            </div>
            {/* @ts-ignore */}
            <div className="mt-1 font-medium">{run.sample?.title}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Prompt Versions
            </div>
            <div className="mt-1 text-xs space-y-1">
              {/* @ts-ignore */}
              <div>P1: {run.phase1_version?.version}</div>
              {/* @ts-ignore */}
              <div>P2: {run.phase2_version?.version}</div>
              {/* @ts-ignore */}
              <div>P3: {run.phase3_version?.version}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Display */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Input</CardTitle>
        </CardHeader>
        <CardContent>
          {/* @ts-ignore */}
          <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap">
            {run.sample?.raw_input}
          </pre>
        </CardContent>
      </Card>

      <Separator />

      <Separator />

      {/* Phase 1: Split & Classification (Editor or Read-only) */}
      <section className="space-y-4">
        {!phase1Result && (
          <div className="p-8 text-center border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Phase 1 Waiting...</p>
          </div>
        )}

        {/* 
           Case 1: Phase 1 Done, but Not Corrected yet 
           -> Show Editor
        */}
        {/* 
           Case 1: Phase 1 Done, but Not Corrected yet 
           -> Show Editor
        */}
        {phase1Result && !phase1CorrectedResult && (
          <Phase1Editor
            runId={id}
            initialEvents={(phase1Result.output_payload as any)?.events || []}
            availableProjects={projects || []}
          />
        )}

        {/* 
           Case 2: Phase 1 Corrected (User Saved)
           -> Show Result Read-only
        */}
        {phase1CorrectedResult && (
          <PhaseResultCard
            title="Phase 1: Split & Classification (Edited)"
            result={phase1CorrectedResult}
            phase="phase1_corrected"
          />
        )}

        {/* Fallback Original Result (Hidden if edited, or shown below?)
            Let's hide original if edited for cleanliness, or show as 'Raw AI Output' in a collapsed view later.
            For now, if corrected exists, we show corrected. If not, we show Editor.
         */}
      </section>

      {/* Phase 2: Context Probing */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Phase 2: Context Probing</h2>
        {phase1CorrectedResult ? (
          <Phase2Container
            runId={id}
            phase1Events={
              (phase1CorrectedResult.output_payload as any)?.events || []
            }
          />
        ) : (
          <div className="p-4 border border-dashed rounded text-muted-foreground text-sm">
            Complete Phase 1 review to proceed.
          </div>
        )}
      </section>

      {/* Phase 3 Result (Placeholder) */}
      <section className="space-y-4 opacity-50">
        <h2 className="text-lg font-semibold">Phase 3: Final Outcome</h2>
        <div className="p-4 border border-dashed rounded text-muted-foreground text-sm">
          Pending Phase 2 completion.
        </div>
      </section>
    </div>
  );
}

function PhaseResultCard({
  title,
  result,
}: {
  title: string;
  result?: any;
  phase?: string;
}) {
  if (!result) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="outline">
          Cost: ${result.cost_usd?.toFixed(6) || "0.00"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simple JSON View for now */}
        <div className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto max-h-[300px]">
          <pre>{JSON.stringify(result.output_payload, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  );
}
