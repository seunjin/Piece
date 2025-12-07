import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/server";

export default async function LabDashboardPage() {
  const supabase = await createClient();

  const { data: runs, error } = await supabase
    .from("ai_test_runs")
    .select(`
      *,
      sample:ai_test_samples(title)
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Test Lab</h1>
          <p className="text-muted-foreground">
            프롬프트 버전을 실험하고 비용/품질을 검증하는 연구소입니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/lab/new">새 테스트 실행</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Sample</TableHead>
                <TableHead>Tokens (In/Out)</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs?.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {/* @ts-ignore: join result */}
                    {run.sample?.title || run.job_title || "Ad-hoc Run"}
                  </TableCell>
                  <TableCell>
                    {run.total_input_tokens} / {run.total_output_tokens}
                  </TableCell>
                  <TableCell>${run.total_cost_usd?.toFixed(6)}</TableCell>
                  <TableCell>
                    {run.created_at &&
                      formatDistanceToNow(new Date(run.created_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/lab/runs/${run.id}`}>상세보기</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!runs || runs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    아직 실행된 테스트가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
