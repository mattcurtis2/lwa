import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Package,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());

  const { data: ordersSummary = [], isLoading, error } = useQuery<OrderSummary[]>({
    queryKey: ['/api/orders/summary'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/orders/summary');
      return res.json();
    },
  });

  const toggleSummary = (date: string) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedSummaries(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="text-sm text-muted-foreground">
            {ordersSummary.reduce((total, summary) => total + summary.totalOrders, 0)} total orders
          </span>
        </div>
      </div>

      {ordersSummary.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders yet</p>
              <p>Orders will appear here once customers start purchasing items.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordersSummary.map((summary) => (
            <Card key={summary.date}>
              <Collapsible 
                open={expandedSummaries.has(summary.date)}
                onOpenChange={() => toggleSummary(summary.date)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedSummaries.has(summary.date) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {formatDate(summary.date)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Saturday Market Day
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            <span className="font-semibold">{summary.totalOrders}</span>
                            <span className="text-sm text-muted-foreground">orders</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">{formatCurrency(summary.totalRevenue)}</span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {summary.orders.length > 0 ? 'Active' : 'No Orders'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      {summary.orders.map((order) => (
                        <Card key={order.id} className="bg-muted/30">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium">{order.customerName}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    Order #{order.id}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {order.customerEmail}
                                  </div>
                                  {order.customerPhone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {order.customerPhone}
                                    </div>
                                  )}
                                </div>
                                {order.pickupLocation && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {order.pickupLocation.location} - {order.pickupLocation.address}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(order.totalAmount)}</div>
                                <Badge 
                                  variant={order.status === 'confirmed' ? 'default' : 'secondary'}
                                  className="text-xs mt-1"
                                >
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Order Items:</h4>
                              <div className="grid gap-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm bg-background rounded p-2">
                                    <span>{item.productName}</span>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span>Qty: {item.quantity}</span>
                                      <span>×</span>
                                      <span>{formatCurrency(item.unitPrice)}</span>
                                      <span>=</span>
                                      <span className="font-medium text-foreground">
                                        {formatCurrency(item.totalPrice)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs text-muted-foreground pt-2 border-t">
                                Ordered: {new Date(order.createdAt).toLocaleString()}
                                {order.stripePaymentIntentId && (
                                  <span className="ml-2">• Stripe ID: {order.stripePaymentIntentId}</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {summary.orders.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No orders for this date</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}