"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// import { Database } from "@/types/supabase";
import { runTest } from "../actions";

interface Sample {
  id: string;
  created_at: string | null;
  title: string;
  job_title: string | null;
  raw_input: string;
}

interface PromptVersion {
  id: string;
  created_at: string | null;
  version: string;
  phase: string;
}

interface NewRunFormProps {
  samples: Sample[];
  promptVersions: PromptVersion[];
}

export function NewRunForm({ samples, promptVersions }: NewRunFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State
  const [presetId, setPresetId] = useState<string>("none");
  const [jobTitle, setJobTitle] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  // Prompts
  const [phase1Id, setPhase1Id] = useState<string>("");
  const [phase2Id, setPhase2Id] = useState<string>("");
  const [phase3Id, setPhase3Id] = useState<string>("");

  const phase1List = promptVersions.filter((p) => p.phase === "phase1");
  const phase2List = promptVersions.filter((p) => p.phase === "phase2");
  const phase3List = promptVersions.filter((p) => p.phase === "phase3");

  // Load defaults (optional)
  // Load defaults (optional)
  useEffect(() => {
    // biome-ignore lint/correctness/useExhaustiveDependencies: One-time init
    if (phase1List.length > 0 && !phase1Id) setPhase1Id(phase1List[0].id);
    if (phase2List.length > 0 && !phase2Id) setPhase2Id(phase2List[0].id);
    if (phase3List.length > 0 && !phase3Id) setPhase3Id(phase3List[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase1List, phase2List, phase3List, phase1Id, phase2Id, phase3Id]);

  // Handle Preset Change
  const handlePresetChange = (val: string) => {
    setPresetId(val);
    if (val === "none") {
      setJobTitle("");
      setRawInput("");
      setSaveToLibrary(false);
    } else {
      const sample = samples.find((s) => s.id === val);
      if (sample) {
        setJobTitle(sample.job_title || "");
        setRawInput(sample.raw_input);
        setSaveToLibrary(false);
      }
    }
  };

  // Handle Input Change (switches to custom if edited)
  const handleInputChange = (field: "job" | "input", value: string) => {
    if (field === "job") setJobTitle(value);
    if (field === "input") setRawInput(value);

    // If we are editing, we are effectively diverging from the preset (unless reverted exactly, but simpler to just detach)
    // Only detach if we were on a preset.
    if (presetId !== "none") {
      setPresetId("none");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phase1Id || !phase2Id || !phase3Id) {
      alert("프롬프트 버전을 모두 선택해주세요.");
      return;
    }
    if (!jobTitle || !rawInput) {
      alert("Job Title과 Raw Input을 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // Determine Payload
      const payload: any = {
        promptVersions: {
          phase1: phase1Id,
          phase2: phase2Id,
          phase3: phase3Id,
        },
      };

      // Case 1: Using exact preset (Preset ID valid + text unchanged ideally, but here if presetId is set we trust it, or we prioritize customInput?)
      // Since we clear presetId on edit, if presetId is set, it means it's untouched.
      // However, user might want to check 'Save to Library' creates a COPY.
      // If presetId is set, we use sampleId.
      if (presetId !== "none" && !saveToLibrary) {
        payload.sampleId = presetId;
      } else {
        // Case 2: Custom Input (or modified preset, or Save as New)
        payload.customInput = {
          job_title: jobTitle,
          raw_input: rawInput,
          saveToLibrary: saveToLibrary,
        };
      }

      const result = await runTest(payload);

      if (!result.success || !result.runId) {
        throw new Error(result.error || "테스트 실행 실패");
      }

      router.push(`/lab/runs/${result.runId}`);
    } catch (error: any) {
      console.error(error);
      alert(`에러 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6">
        {/* Preset Selector */}
        <div className="space-y-2">
          <Label>Sample Preset</Label>
          <Select value={presetId} onValueChange={handlePresetChange}>
            <SelectTrigger className="font-medium">
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-muted-foreground italic">
                (Custom Input)
              </SelectItem>
              {samples.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  [{s.job_title}] {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unified Input Fields */}
        <div className="space-y-4 border p-4 rounded-md bg-slate-50/50">
          <div className="space-y-2">
            <Label htmlFor="job-title" className="text-xs">
              Job Title
            </Label>
            <Select
              value={jobTitle}
              onValueChange={(v) => handleInputChange("job", v)}
            >
              <SelectTrigger id="job-title bg-white">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Backend Developer">
                  Backend Developer
                </SelectItem>
                <SelectItem value="Frontend Developer">
                  Frontend Developer
                </SelectItem>
                <SelectItem value="Fullstack Developer">
                  Fullstack Developer
                </SelectItem>
                <SelectItem value="Mobile Developer">
                  Mobile Developer
                </SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="Product Designer">
                  Product Designer
                </SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raw-input" className="text-xs">
              Raw Input (Text)
            </Label>
            <Textarea
              id="raw-input"
              className="min-h-[200px] font-mono text-sm bg-white shadow-sm"
              placeholder="Paste your daily logs or resume content here..."
              value={rawInput}
              onChange={(e) => handleInputChange("input", e.target.value)}
            />
          </div>

          {/* Save Option */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="save-lib"
              checked={saveToLibrary}
              onCheckedChange={(checked) =>
                setSaveToLibrary(checked as boolean)
              }
            />
            <Label
              htmlFor="save-lib"
              className="text-sm font-normal cursor-pointer"
            >
              Save this input to Library for later
            </Label>
          </div>
        </div>

        {/* Prompt Versions (Compact) */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Phase 1</Label>
            <Select value={phase1Id} onValueChange={setPhase1Id}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phase1List.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Phase 2</Label>
            <Select value={phase2Id} onValueChange={setPhase2Id}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phase2List.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Phase 3</Label>
            <Select value={phase3Id} onValueChange={setPhase3Id}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phase3List.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="w-40">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Test
        </Button>
      </CardFooter>
    </form>
  );
}
