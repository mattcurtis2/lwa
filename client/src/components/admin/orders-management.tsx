import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronRight,
  FileText,
  Printer,
  TestTube,
  Building
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
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'all' | 'test' | 'prod'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const { data: ordersSummary = [], isLoading, error, refetch } = useQuery<OrderSummary[]>({
    queryKey: ['/api/orders/summary', selectedEnvironment],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/orders/summary?env=${selectedEnvironment}`);
      return res.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds to show new orders
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

  // Get unique pickup dates for order sheet selection
  const availableDates = ordersSummary.map(s => s.date).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Filter orders for order sheet view
  const getOrdersForSheet = () => {
    if (!selectedDate) return [];
    const summary = ordersSummary.find(s => s.date === selectedDate);
    return summary?.orders || [];
  };

  // Group orders by pickup location for order sheet
  const getOrdersByLocation = () => {
    const orders = getOrdersForSheet();
    const grouped: Record<string, Order[]> = {};
    
    orders.forEach(order => {
      const location = order.pickupLocation?.location || 'Unknown Location';
      if (!grouped[location]) {
        grouped[location] = [];
      }
      grouped[location].push(order);
    });
    
    return grouped;
  };

  // Get consolidated items for production (what to make)
  const getConsolidatedItems = () => {
    const orders = getOrdersForSheet();
    const itemCounts: Record<string, { quantity: number; orders: string[] }> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productName;
        if (!itemCounts[key]) {
          itemCounts[key] = { quantity: 0, orders: [] };
        }
        itemCounts[key].quantity += item.quantity;
        itemCounts[key].orders.push(`#${order.id}`);
      });
    });
    
    return itemCounts;
  };

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Orders Overview
          </TabsTrigger>
          <TabsTrigger value="sheet" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Order Sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">

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
        </TabsContent>

        <TabsContent value="sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Production Order Sheet
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Select Date:</label>
                    <select 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="">Select a pickup date</option>
                      {availableDates.map(date => (
                        <option key={date} value={date}>
                          {formatDate(date)} ({ordersSummary.find(s => s.date === date)?.totalOrders || 0} orders)
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedDate && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.print()}
                      className="flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print Sheet
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {selectedDate && (
              <CardContent className="space-y-6 print:space-y-4">
                <div className="print:break-before-page">
                  <div className="text-center mb-6 print:mb-4">
                    <h1 className="text-2xl font-bold print:text-lg">Little Way Acres</h1>
                    <h2 className="text-xl print:text-base">Production Order Sheet</h2>
                    <p className="text-lg print:text-sm font-medium">{formatDate(selectedDate)}</p>
                    <Badge variant={selectedEnvironment === 'test' ? 'secondary' : 'default'} className="mt-2">
                      {selectedEnvironment === 'all' ? 'All Orders' : selectedEnvironment === 'test' ? 'TEST ENVIRONMENT' : 'PRODUCTION'}
                    </Badge>
                  </div>

                  {/* Items to Make Summary */}
                  <Card className="mb-6 print:mb-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg print:text-base">Items to Make</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 print:gap-2">
                        {Object.entries(getConsolidatedItems()).map(([item, data]) => (
                          <div key={item} className="flex justify-between items-center p-3 print:p-2 bg-muted rounded-lg print:bg-gray-100">
                            <span className="font-medium print:text-sm">{item}</span>
                            <div className="flex items-center gap-4 print:gap-2">
                              <Badge variant="outline" className="print:text-xs">
                                Quantity: {data.quantity}
                              </Badge>
                              <span className="text-sm text-muted-foreground print:text-xs">
                                Orders: {data.orders.join(', ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders by Pickup Location */}
                  <div className="space-y-4 print:space-y-3">
                    {Object.entries(getOrdersByLocation()).map(([location, locationOrders]) => (
                      <Card key={location}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg print:text-base">
                            <MapPin className="w-5 h-5 print:w-4 print:h-4" />
                            {location}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {locationOrders.length} orders • Total: {formatCurrency(
                              locationOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
                            )}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 print:space-y-2">
                            {locationOrders.map((order) => (
                              <div key={order.id} className="border rounded-lg p-4 print:p-3 print:border-gray-300">
                                <div className="flex justify-between items-start mb-3 print:mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold print:text-sm">Order #{order.id}</span>
                                      <Badge 
                                        variant={order.stripePaymentIntentId?.includes('test') ? 'secondary' : 'default'}
                                        className="text-xs"
                                      >
                                        {order.stripePaymentIntentId?.includes('test') ? 'TEST' : 'PROD'}
                                      </Badge>
                                    </div>
                                    <p className="font-medium print:text-sm">{order.customerName}</p>
                                    <p className="text-sm text-muted-foreground print:text-xs">{order.customerEmail}</p>
                                    {order.customerPhone && (
                                      <p className="text-sm text-muted-foreground print:text-xs">{order.customerPhone}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold print:text-sm">{formatCurrency(order.totalAmount)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 print:space-y-1">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm print:text-xs bg-background rounded p-2 print:p-1">
                                      <span>{item.productName}</span>
                                      <span>Qty: {item.quantity}</span>
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

                  {getOrdersForSheet().length === 0 && (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No orders for this date</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            )}

            {!selectedDate && (
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a pickup date to view order sheet</p>
                  <p>Choose a date to see production requirements and customer orders.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}