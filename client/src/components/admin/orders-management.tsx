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
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    staleTime: 0, // Always fetch fresh data when requested
  });

  const availableDates = ordersSummary.map(s => s.date);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Get orders for the selected date or all orders if no date selected
  const getOrdersForSheet = () => {
    if (!selectedDate) return [];
    
    const summary = ordersSummary.find(s => s.date === selectedDate);
    return summary ? summary.orders : [];
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

  // Get orders sorted by last name for packing list
  const getOrdersByLastName = () => {
    const orders = getOrdersForSheet();
    const grouped: Record<string, Order[]> = {};
    
    orders.forEach(order => {
      const location = order.pickupLocation?.location || 'Unknown Location';
      if (!grouped[location]) {
        grouped[location] = [];
      }
      grouped[location].push(order);
    });
    
    // Sort each location's orders by last name
    Object.keys(grouped).forEach(location => {
      grouped[location].sort((a, b) => {
        const lastNameA = a.customerName.split(' ').pop()?.toLowerCase() || '';
        const lastNameB = b.customerName.split(' ').pop()?.toLowerCase() || '';
        return lastNameA.localeCompare(lastNameB);
      });
    });
    
    return grouped;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p className="text-lg font-medium">Error loading orders</p>
            <p>Please try refreshing the page.</p>
          </div>
        </CardContent>
      </Card>
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
            <Calendar className="w-3 h-3 mr-1" />
            Refresh Orders
          </Button>
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
          <TabsTrigger value="packing" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Packing List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{summary.totalOrders} orders</span>
                          <span>{formatCurrency(summary.totalRevenue)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedDate(summary.date);
                              setActiveTab('sheet');
                            }}
                            className="text-xs"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Order Sheet
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedDate(summary.date);
                              setActiveTab('packing');
                            }}
                            className="text-xs"
                          >
                            <Package className="w-3 h-3 mr-1" />
                            Packing List
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSummary(summary.date)}
                            className="text-xs"
                          >
                            {expandedSummaries.has(summary.date) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <Collapsible open={expandedSummaries.has(summary.date)}>
                    <CollapsibleContent>
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
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{order.customerName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm text-muted-foreground">{order.customerEmail}</span>
                                  </div>
                                  {order.customerPhone && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <Phone className="w-4 h-4" />
                                      <span className="text-sm text-muted-foreground">{order.customerPhone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {order.pickupLocation?.location || 'Unknown Location'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      on {formatDate(order.pickupDate)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator className="my-3" />
                              
                              <div className="space-y-1">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm bg-background rounded p-2">
                                    <span>{item.productName}</span>
                                    <div className="flex items-center gap-4">
                                      <span>Qty: {item.quantity}</span>
                                      <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
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
                  Order Sheet
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
                    <h2 className="text-xl print:text-base">Order Sheet - Production Summary</h2>
                    <p className="text-lg print:text-sm font-medium">{formatDate(selectedDate)}</p>
                    <Badge variant={selectedEnvironment === 'test' ? 'secondary' : 'default'} className="mt-2">
                      {selectedEnvironment === 'all' ? 'All Orders' : selectedEnvironment === 'test' ? 'TEST ENVIRONMENT' : 'PRODUCTION'}
                    </Badge>
                  </div>

                  {/* Production Summary - Items to Make */}
                  <Card className="mb-6 print:mb-4 print:break-inside-avoid">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg print:text-base">
                        <Package className="w-5 h-5 print:w-4 print:h-4" />
                        Items to Make
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Production summary for {formatDate(selectedDate)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 print:gap-2">
                        {Object.entries(getConsolidatedItems()).map(([item, data]) => (
                          <div key={item} className="border rounded-lg p-3 print:p-2 print:border-gray-300 bg-background print:bg-white">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-lg print:text-base">{item}</span>
                              <div className="text-right">
                                <p className="font-bold text-xl print:text-lg text-primary">
                                  Make: {data.quantity}
                                </p>
                                <p className="text-xs text-muted-foreground print:text-xs">
                                  Orders: {data.orders.join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders by Pickup Location */}
                  <div className="space-y-6 print:space-y-4">
                    {Object.entries(getOrdersByLastName()).map(([location, locationOrders]) => (
                      <Card key={location} className="print:break-inside-avoid">
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
                          <div className="grid gap-3 print:gap-2">
                            {locationOrders.map((order) => (
                              <div key={order.id} className="border rounded-lg p-3 print:p-2 print:border-gray-300 bg-background print:bg-white">
                                <div className="flex justify-between items-start mb-2 print:mb-1">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold">Order #{order.id}</span>
                                      <Badge 
                                        variant={order.stripePaymentIntentId?.includes('test') ? 'secondary' : 'default'}
                                        className="text-xs print:text-xs"
                                      >
                                        {order.stripePaymentIntentId?.includes('test') ? 'TEST' : 'PROD'}
                                      </Badge>
                                    </div>
                                    <p className="font-medium text-base print:text-sm">{order.customerName}</p>
                                    <p className="text-sm text-muted-foreground print:text-xs">{order.customerEmail}</p>
                                    {order.customerPhone && (
                                      <p className="text-sm text-muted-foreground print:text-xs">{order.customerPhone}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-lg print:text-base">{formatCurrency(order.totalAmount)}</p>
                                  </div>
                                </div>
                                
                                <div className="bg-muted rounded p-2 print:bg-gray-50 print:p-1">
                                  <p className="font-medium text-sm print:text-xs mb-1">Items:</p>
                                  <div className="space-y-1 print:space-y-0">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between text-sm print:text-xs">
                                        <span className="font-medium">{item.productName}</span>
                                        <span className="font-semibold">Qty: {item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
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
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                  <p>Choose a date to see detailed orders organized by pickup location.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="packing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Packing List by Market
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
                      Print List
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
                    <h2 className="text-xl print:text-base">Packing List - Alphabetical by Last Name</h2>
                    <p className="text-lg print:text-sm font-medium">{formatDate(selectedDate)}</p>
                    <Badge variant={selectedEnvironment === 'test' ? 'secondary' : 'default'} className="mt-2">
                      {selectedEnvironment === 'all' ? 'All Orders' : selectedEnvironment === 'test' ? 'TEST ENVIRONMENT' : 'PRODUCTION'}
                    </Badge>
                  </div>

                  {/* Packing List by Location (Alphabetical by Last Name) */}
                  <div className="space-y-6 print:space-y-4">
                    {Object.entries(getOrdersByLastName()).map(([location, locationOrders]) => (
                      <Card key={location} className="print:break-inside-avoid">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg print:text-base">
                            <MapPin className="w-5 h-5 print:w-4 print:h-4" />
                            {location}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {locationOrders.length} orders • Total: {formatCurrency(
                              locationOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
                            )} • Alphabetical by Last Name
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3 print:gap-2">
                            {locationOrders.map((order, index) => {
                              const lastName = order.customerName.split(' ').pop() || '';
                              return (
                                <div key={order.id} className="border rounded-lg p-3 print:p-2 print:border-gray-300 bg-background print:bg-white">
                                  <div className="flex justify-between items-start mb-2 print:mb-1">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-lg print:text-base">
                                          {index + 1}. {lastName.toUpperCase()}
                                        </span>
                                        <Badge 
                                          variant={order.stripePaymentIntentId?.includes('test') ? 'secondary' : 'default'}
                                          className="text-xs print:text-xs"
                                        >
                                          {order.stripePaymentIntentId?.includes('test') ? 'TEST' : 'PROD'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground print:text-xs">
                                          Order #{order.id}
                                        </span>
                                      </div>
                                      <p className="font-medium text-base print:text-sm">{order.customerName}</p>
                                      <p className="text-sm text-muted-foreground print:text-xs">{order.customerEmail}</p>
                                      {order.customerPhone && (
                                        <p className="text-sm text-muted-foreground print:text-xs">{order.customerPhone}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-lg print:text-base">{formatCurrency(order.totalAmount)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-muted rounded p-2 print:bg-gray-50 print:p-1">
                                    <p className="font-medium text-sm print:text-xs mb-1">Items:</p>
                                    <div className="space-y-1 print:space-y-0">
                                      {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm print:text-xs">
                                          <span className="font-medium">{item.productName}</span>
                                          <span className="font-semibold">Qty: {item.quantity}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a pickup date to view packing list</p>
                  <p>Choose a date to see orders organized alphabetically by last name for easy packing.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}