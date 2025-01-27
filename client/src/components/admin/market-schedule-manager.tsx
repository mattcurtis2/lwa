import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MarketSchedule } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function MarketScheduleManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSchedule, setEditingSchedule] = useState<MarketSchedule | null>(null);

  const { data: schedules = [] } = useQuery<MarketSchedule[]>({
    queryKey: ["/api/market-schedules"],
  });

  const createMutation = useMutation({
    mutationFn: async (newSchedule: Partial<MarketSchedule>) => {
      const res = await fetch("/api/market-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });
      if (!res.ok) throw new Error("Failed to create schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-schedules"] });
      toast({ title: "Schedule created successfully" });
      setEditingSchedule(null);
    },
    onError: () => {
      toast({ title: "Failed to create schedule", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (schedule: MarketSchedule) => {
      const res = await fetch(`/api/market-schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error("Failed to update schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-schedules"] });
      toast({ title: "Schedule updated successfully" });
      setEditingSchedule(null);
    },
    onError: () => {
      toast({ title: "Failed to update schedule", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/market-schedules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-schedules"] });
      toast({ title: "Schedule deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete schedule", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scheduleData = {
      location: formData.get('location') as string,
      address: formData.get('address') as string,
      dayOfWeek: formData.get('dayOfWeek') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      description: formData.get('description') as string,
      seasonStart: formData.get('seasonStart') as string || null,
      seasonEnd: formData.get('seasonEnd') as string || null,
      isActive: true,
    };

    if (editingSchedule) {
      updateMutation.mutate({ ...editingSchedule, ...scheduleData });
    } else {
      createMutation.mutate(scheduleData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Schedules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Schedule Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingSchedule?.location}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={editingSchedule?.address}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Input
                  id="dayOfWeek"
                  name="dayOfWeek"
                  defaultValue={editingSchedule?.dayOfWeek}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  defaultValue={editingSchedule?.startTime}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  defaultValue={editingSchedule?.endTime}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingSchedule?.description || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonStart">Season Start (Optional)</Label>
                <Input
                  type="date"
                  id="seasonStart"
                  name="seasonStart"
                  defaultValue={editingSchedule?.seasonStart?.toString()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonEnd">Season End (Optional)</Label>
                <Input
                  type="date"
                  id="seasonEnd"
                  name="seasonEnd"
                  defaultValue={editingSchedule?.seasonEnd?.toString()}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {editingSchedule && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSchedule(null)}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingSchedule ? 'Update' : 'Add'} Schedule
              </Button>
            </div>
          </form>

          {/* Schedules List */}
          <div className="space-y-4 mt-8">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{schedule.location}</h3>
                      <p className="text-sm text-muted-foreground">{schedule.address}</p>
                      <div className="mt-2">
                        <p>{schedule.dayOfWeek} • {schedule.startTime} - {schedule.endTime}</p>
                        {schedule.description && (
                          <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingSchedule(schedule)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this schedule?')) {
                            deleteMutation.mutate(schedule.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
