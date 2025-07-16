import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingCart, MapPin, Mail } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/cart-context';

export default function OrderConfirmation() {
  const [, navigate] = useLocation();
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart when order is confirmed
    clearCart();
  }, [clearCart]);

  // Get payment intent from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const paymentIntentId = urlParams.get('payment_intent');
  const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

  if (!paymentIntentId) {
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Thank you for your order! Your payment has been processed successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Payment ID: {paymentIntentId}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Next Steps:</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• You will receive a confirmation email with pickup details</li>
              <li>• Please bring a valid ID when picking up your order</li>
              <li>• Arrive during your selected market hours</li>
              <li>• Look for the Little Way Acres booth</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Questions?</span>
            </div>
            <p className="text-sm text-blue-700">
              If you have any questions about your order or need to make changes, 
              please contact us at littlewayacres@gmail.com
            </p>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}