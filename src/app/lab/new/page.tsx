import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { NewRunForm } from "./new-run-form";

export default async function NewRunPage() {
  const supabase = await createClient();

  // Fetch data for selectors
  const { data: samples } = await supabase
    .from("ai_test_samples")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: promptVersions } = await supabase
    .from("ai_prompt_versions")
    .select("*")
    .order("version", { ascending: false });

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Start New Test Run</CardTitle>
        </CardHeader>
        <NewRunForm
          samples={samples || []}
          promptVersions={promptVersions || []}
        />
      </Card>
    </div>
  );
}
