"use client";

import { ArrowRight, Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createProject, submitPhase1Edits } from "@/app/lab/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EventItem {
  idx: number;
  original_text: string;
  category: "achievement_ready" | "needs_context" | "not_achievement";
  missing_info?: string[];
  is_seed_candidate: boolean;

  // Project Assignment
  project_id?: string;
  new_project_name?: string;
}

interface Project {
  id: string;
  name: string;
}

interface Phase1EditorProps {
  runId: string;
  initialEvents: EventItem[];
  availableProjects: Project[];
}

export function Phase1Editor({
  runId,
  initialEvents,
  availableProjects,
}: Phase1EditorProps) {
  // Initialize events. If project auto-mapping is implemented later, it would go here.
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [localProjects, setLocalProjects] =
    useState<Project[]>(availableProjects);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Unified Event Change Handler
   */
  const handleEventChange = (
    idx: number,
    field: keyof EventItem,
    value: any,
  ) => {
    setEvents((prev) =>
      prev.map((e) => (e.idx === idx ? { ...e, [field]: value } : e)),
    );
  };

  const handleDelete = (idx: number) => {
    setEvents((prev) => prev.filter((e) => e.idx !== idx));
  };

  const handleProjectSelect = (idx: number, projectId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.idx === idx
          ? { ...e, project_id: projectId, new_project_name: undefined }
          : e,
      ),
    );
  };

  const handleProjectCreate = async (idx: number, name: string) => {
    // Optimistic or Server Action?
    // Since we need an ID to assign, we should create it immediately on server.
    const tid = toast.loading(`프로젝트 생성 중: ${name}...`);
    const result = await createProject(name);

    if (result.success && result.project) {
      toast.dismiss(tid);
      toast.success("프로젝트 생성 완료", { description: result.project.name });

      const newProj = result.project;
      // Add to local list so it appears in list
      setLocalProjects((prev) => [...prev, newProj]);

      // Auto select it for this event
      setEvents((prev) =>
        prev.map((e) =>
          e.idx === idx
            ? { ...e, project_id: newProj.id, new_project_name: undefined }
            : e,
        ),
      );
    } else {
      toast.dismiss(tid);
      toast.error("프로젝트 생성 실패", { description: result.error });
    }
  };

  const handleSubmit = async () => {
    // Validation: All active events (achievement/needs_context) should have a project assigned
    // We only check for project_id because new_project_name should have been resolved to project_id via handleProjectCreate
    const unassigned = events.filter(
      (e) => e.category !== "not_achievement" && !e.project_id,
    );
    if (unassigned.length > 0) {
      toast.error("프로젝트 미할당", {
        description: "모든 유효한 이벤트에 프로젝트를 할당해주세요.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPhase1Edits(runId, events);
      if (result.success) {
        toast.success("저장 완료", {
          description: "Phase 2 준비 단계로 이동합니다.",
        });
      } else {
        toast.error("오류 발생", { description: result.error });
      }
    } catch (e) {
      console.error(e);
      toast.error("오류 발생", {
        description: "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Phase 1 분석 결과</h2>
          <p className="text-muted-foreground text-sm">
            이벤트를 검토하고 <strong>프로젝트를 할당</strong>하세요.
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장 및 계속"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card
            key={event.idx}
            className={
              event.category === "not_achievement"
                ? "opacity-60 bg-muted/50 border-dashed"
                : "border-l-4 border-l-primary"
            }
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-2">
                <Badge variant={getCategoryBadgeVariant(event.category)}>
                  {event.category === "achievement_ready"
                    ? "성과 도출 가능"
                    : event.category === "needs_context"
                      ? "추가 정보 필요"
                      : "성과 아님"}
                </Badge>
                {event.is_seed_candidate && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-yellow-600"
                  >
                    Seed 후보
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                onClick={() => handleDelete(event.idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor={`original-text-${event.idx}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  원문 텍스트 (Original Text)
                </label>
                <Textarea
                  id={`original-text-${event.idx}`}
                  value={event.original_text}
                  onChange={(e) =>
                    handleEventChange(
                      event.idx,
                      "original_text",
                      e.target.value,
                    )
                  }
                  className="bg-white min-h-[80px]"
                />
              </div>

              {/* Second Row: Category & Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor={`category-${event.idx}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    카테고리
                  </label>
                  <Select
                    value={event.category}
                    onValueChange={(val) =>
                      handleEventChange(event.idx, "category", val)
                    }
                  >
                    <SelectTrigger
                      id={`category-${event.idx}`}
                      className="bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achievement_ready">
                        Achievement Ready
                      </SelectItem>
                      <SelectItem value="needs_context">
                        Needs Context (Phase 2)
                      </SelectItem>
                      <SelectItem value="not_achievement">
                        Not Achievement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Selector */}
                <div className="space-y-1">
                  <label
                    htmlFor={`project-${event.idx}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    프로젝트 할당
                  </label>
                  {event.category === "not_achievement" ? (
                    <div className="text-sm text-muted-foreground italic py-2">
                      필요 없음
                    </div>
                  ) : (
                    <ProjectCombobox
                      projects={localProjects}
                      selectedProjectId={event.project_id}
                      newProjectName={event.new_project_name}
                      onSelect={(id) => handleProjectSelect(event.idx, id)}
                      onCreate={(name) => handleProjectCreate(event.idx, name)}
                    />
                  )}
                </div>
              </div>

              {event.missing_info && event.missing_info.length > 0 && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  <strong>누락된 정보: </strong> {event.missing_info.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getCategoryBadgeVariant(category: string) {
  switch (category) {
    case "achievement_ready":
      return "default";
    case "needs_context":
      return "secondary";
    case "not_achievement":
      return "outline";
    default:
      return "secondary";
  }
}

// --- Project Combobox Component ---
interface ProjectComboboxProps {
  projects: Project[];
  selectedProjectId?: string;
  newProjectName?: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
}

function ProjectCombobox({
  projects,
  selectedProjectId,
  newProjectName,
  onSelect,
  onCreate,
}: ProjectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const displayText = newProjectName
    ? `[New] ${newProjectName}`
    : selectedProject?.name || "프로젝트 선택...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-white"
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="검색 또는 새 프로젝트..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2 text-center text-sm">
              <p className="text-muted-foreground mb-2">
                검색 결과가 없습니다.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full h-8 justify-start"
                onMouseDown={(e) => {
                  // Prevent focus loss issue
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => {
                  if (inputValue.trim()) {
                    onCreate(inputValue.trim());
                    setOpen(false);
                  }
                }}
              >
                <Plus className="mr-2 h-3 w-3" />"{inputValue}" 생성하기
              </Button>
            </CommandEmpty>
            <CommandGroup heading="최근 프로젝트">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    onSelect(project.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProjectId === project.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {project.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
