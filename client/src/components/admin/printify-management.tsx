import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: Array<{
    src: string;
    alt?: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    is_enabled: boolean;
  }>;
  blueprintId: number;
  external_id: string;
  printifyUrl: string;
  visible: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

interface SyncStats {
  totalProducts: number;
  lastSyncTime: string;
  isStale: boolean;
  cacheStatus: 'fresh' | 'stale' | 'empty';
}

export default function PrintifyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  // Query to get current product count and sync status
  const { data: syncStats, isLoading: statsLoading } = useQuery<SyncStats>({
    queryKey: ["printify-sync-stats"],
    queryFn: async () => {
      const response = await fetch("/api/printify/products");
      const products: PrintifyProduct[] = await response.json();
      
      if (products.length === 0) {
        return {
          totalProducts: 0,
          lastSyncTime: '',
          isStale: true,
          cacheStatus: 'empty' as const
        };
      }

      // Use the first product's last sync time as representative
      const lastSyncTime = products[0].updated_at;
      const syncDate = new Date(lastSyncTime);
      const hoursSinceSync = (Date.now() - syncDate.getTime()) / (1000 * 60 * 60);
      
      return {
        totalProducts: products.length,
        lastSyncTime: lastSyncTime,
        isStale: hoursSinceSync > 12,
        cacheStatus: hoursSinceSync > 12 ? 'stale' as const : 'fresh' as const
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutation to trigger manual sync
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/printify/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to sync products");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync successful",
        description: `Synced ${data.count} products from Printify`,
      });
      queryClient.invalidateQueries({ queryKey: ["printify-sync-stats"] });
      queryClient.invalidateQueries({ queryKey: ["printify-products"] });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncMutation.mutateAsync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getCacheStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-green-100 text-green-800';
      case 'stale': return 'bg-yellow-100 text-yellow-800';
      case 'empty': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCacheStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return <CheckCircle className="w-4 h-4" />;
      case 'stale': return <Clock className="w-4 h-4" />;
      case 'empty': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cache Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getCacheStatusColor(syncStats?.cacheStatus || 'empty')}>
                  <div className="flex items-center gap-1">
                    {getCacheStatusIcon(syncStats?.cacheStatus || 'empty')}
                    {syncStats?.cacheStatus === 'fresh' && 'Fresh'}
                    {syncStats?.cacheStatus === 'stale' && 'Stale'}
                    {syncStats?.cacheStatus === 'empty' && 'Empty'}
                  </div>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Products:</span>
                <span className="text-sm">{syncStats?.totalProducts || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time:</span>
                <span className="text-sm">
                  {syncStats?.lastSyncTime 
                    ? format(new Date(syncStats.lastSyncTime), 'PPp')
                    : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-sync:</span>
                <span className="text-sm">Every 12 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSync}
          disabled={isSyncing || syncMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing || syncMutation.isPending ? 'animate-spin' : ''}`} />
          {isSyncing || syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
        </Button>
        
        {syncStats?.isStale && (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Cache is stale (&gt;12 hours old)
          </Badge>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Products are automatically synced from Printify every 12 hours. You can manually sync at any time using the button above.</p>
        <p className="mt-1">
          <strong>Fresh:</strong> Synced within 12 hours | 
          <strong> Stale:</strong> Synced more than 12 hours ago | 
          <strong> Empty:</strong> No products cached
        </p>
      </div>
    </div>
  );
}