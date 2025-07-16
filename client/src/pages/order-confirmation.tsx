import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingCart, MapPin, Mail, ExternalLink, Calendar, User, Phone } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/cart-context';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  items: OrderItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupLocation: {
    id: number;
    location: string;
    address: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  total: number;
  orderDate: string;
}

export default function OrderConfirmation() {
  const [, navigate] = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Get stored order data
    const storedOrderData = localStorage.getItem('orderData');
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
    }
  }, []);

  // Get payment intent from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const paymentIntentId = urlParams.get('payment_intent');
  const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

  if (!paymentIntentId || !orderData) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find your order. Please try again or contact support.
            </p>
            <Link href="/market">
              <a>
                <Button>Return to Market</Button>
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLWAPickup = orderData.pickupLocation.location.toLowerCase().includes('little way acres');
  const orderDateTime = new Date(orderData.orderDate);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Order Confirmation Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <p className="text-muted-foreground">
            Thank you for your order! Your payment has been processed successfully.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t font-semibold">
              <span>Total</span>
              <span>${orderData.total.toFixed(2)}</span>
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Payment ID: {paymentIntentId}
              </p>
              <p className="text-sm text-muted-foreground">
                Order Date: {orderDateTime.toLocaleDateString()} at {orderDateTime.toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Pickup Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer & Pickup Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{orderData.customer.firstName} {orderData.customer.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{orderData.customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{orderData.customer.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Pickup Location</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{orderData.pickupLocation.location}</p>
                <p className="text-sm text-muted-foreground">{orderData.pickupLocation.address}</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{orderData.pickupLocation.dayOfWeek}</span>
                  <span className="text-sm text-muted-foreground">
                    {orderData.pickupLocation.startTime} - {orderData.pickupLocation.endTime}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pickup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pickup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLWAPickup ? (
            <div className="space-y-3">
              <p className="text-sm">
                Please go to <strong>Little Way Acres</strong> and pick up your items at the farm stand in clear totes.
              </p>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <a 
                  href="https://maps.google.com/?q=Little+Way+Acres" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View on Google Maps
                </a>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Look for the farm stand with clear totes</li>
                <li>• Find the bag marked with your name</li>
                <li>• Bring a valid ID for order verification</li>
                <li>• Arrive during the specified pickup hours</li>
                <li>• Enjoy your LWA order!</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                Please go to the <strong>Muskegon Farmers Market</strong> and find the Little Way Acres stand located between spots 59-57.
              </p>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <a 
                  href="https://maps.google.com/?q=Muskegon+Farmers+Market" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View on Google Maps
                </a>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Look for the Little Way Acres stand between spots 59-57</li>
                <li>• Find the bag marked with your name</li>
                <li>• Bring a valid ID for order verification</li>
                <li>• Arrive during market hours: {orderData.pickupLocation.startTime} - {orderData.pickupLocation.endTime}</li>
                <li>• Enjoy your LWA order!</li>
              </ul>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Questions?</span>
            </div>
            <p className="text-sm text-blue-700">
              If you have any questions about your order or need to make changes, 
              please contact us at littlewayacresmi@gmail.com
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href="/market">
          <a className="flex-1">
            <Button variant="outline" className="w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </a>
        </Link>
        <Link href="/">
          <a className="flex-1">
            <Button className="w-full">
              Return Home
            </Button>
          </a>
        </Link>
      </div>
    </div>
  );
}