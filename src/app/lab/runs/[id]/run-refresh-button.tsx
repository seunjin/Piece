"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RunRefreshButton() {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.refresh()}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Refresh Status
    </Button>
  );
}
