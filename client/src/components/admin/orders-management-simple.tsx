import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface Order {
  id: number;
  stripePaymentIntentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  pickupLocation?: {
    location: string;
    address: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
}

interface OrderSummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  orders: Order[];
}

export default function OrdersManagement() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<'all' | 'test' | 'prod'>('all');

  const { data: ordersSummary = [], isLoading, error, refetch } = useQuery<OrderSummary[]>({
    queryKey: ['/api/orders/summary', selectedEnvironment],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/orders/summary?env=${selectedEnvironment}`);
      return res.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds to show new orders
  });

  const formatDate = (dateString: string) => {
    const formatted = new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    // Ensure proper capitalization
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Error loading orders. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Environment:</label>
            <select 
              value={selectedEnvironment} 
              onChange={(e) => setSelectedEnvironment(e.target.value as 'all' | 'test' | 'prod')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Orders</option>
              <option value="test">Test Orders</option>
              <option value="prod">Production Orders</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm text-muted-foreground">
              {ordersSummary.reduce((total, summary) => total + summary.totalOrders, 0)} total orders
            </span>
          </div>
        </div>
      </div>

      {ordersSummary.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders found</p>
              <p>Orders will appear here as customers make purchases.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordersSummary.map((summary) => (
            <Card key={summary.date}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {formatDate(summary.date)}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{summary.totalOrders} orders</span>
                    <span>{formatCurrency(summary.totalRevenue)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Order #{order.id}</span>
                            <Badge 
                              variant={order.stripePaymentIntentId?.includes('test') ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {order.stripePaymentIntentId?.includes('test') ? 'TEST' : 'PROD'}
                            </Badge>
                          </div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                          {order.customerPhone && (
                            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Pickup: {order.pickupLocation?.location || 'Unknown'} on {formatDate(order.pickupDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm bg-background rounded p-2">
                            <span>{item.productName}</span>
                            <span>Qty: {item.quantity} @ {formatCurrency(item.unitPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}