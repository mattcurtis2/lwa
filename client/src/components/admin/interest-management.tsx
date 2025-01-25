import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatDisplayDate } from "@/lib/date-utils";
import { Dog, Litter, LitterInterestSignup } from "@db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InterestManagement() {
  const { toast } = useToast();
  const [selectedLitter, setSelectedLitter] = useState<number | null>(null);

  const { data: litters = [] } = useQuery<(Litter & {
    mother?: Dog;
    father?: Dog;
  })[]>({
    queryKey: ["/api/litters"],
  });

  const { data: signups = [] } = useQuery<LitterInterestSignup[]>({
    queryKey: [`/api/litters/${selectedLitter}/interest-signups`],
    enabled: !!selectedLitter,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Litter Interest Management</h2>
        <p className="text-muted-foreground mb-6">
          View and manage interest signups for your litters
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        {litters.map((litter) => (
          <Button
            key={litter.id}
            variant={selectedLitter === litter.id ? "default" : "outline"}
            onClick={() => setSelectedLitter(litter.id)}
          >
            {litter.mother?.name} x {litter.father?.name}
            <span className="ml-2 text-xs">
              ({formatDisplayDate(new Date(litter.dueDate))})
            </span>
          </Button>
        ))}
      </div>

      {selectedLitter && (
        <Card>
          <CardHeader>
            <CardTitle>Interest Signups</CardTitle>
            <CardDescription>
              Manage interest signups for the selected litter
            </CardDescription>
          </CardHeader>
          <CardContent>
            {signups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No interest signups yet for this litter
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Farm Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell className="font-medium">
                        {signup.fullName}
                      </TableCell>
                      <TableCell>{signup.farmName || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{signup.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {signup.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{signup.desiredPurpose}</TableCell>
                      <TableCell>{getStatusBadge(signup.status)}</TableCell>
                      <TableCell>
                        {formatDisplayDate(new Date(signup.createdAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
