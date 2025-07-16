import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, MapPin, User, CreditCard, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface MarketSchedule {
  id: number;
  location: string;
  address: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface CheckoutFormData {
  pickupLocation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    pickupLocation: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const { data: schedules = [] } = useQuery<MarketSchedule[]>({
    queryKey: ['/api/market-schedules'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/market-schedules');
      return res.json();
    },
  });

  const handleStepNext = async () => {
    if (currentStep === 1 && !formData.pickupLocation) {
      toast({
        title: "Pickup Location Required",
        description: "Please select a pickup location to continue.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          title: "Required Information Missing",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Update payment intent with customer and pickup information
      const paymentIntentId = clientSecret.split('_secret_')[0];
      const selectedSchedule = schedules.find(s => s.id.toString() === formData.pickupLocation);
      
      try {
        await apiRequest("POST", "/api/update-payment-intent", {
          paymentIntentId,
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          pickupLocation: selectedSchedule
        });
      } catch (error) {
        console.error("Error updating payment intent:", error);
        toast({
          title: "Error",
          description: "Failed to update payment information. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handleStepBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    // Store order data in localStorage before payment
    const orderData = {
      items: items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price?.replace('$', '') || '0'),
        quantity: item.quantity
      })),
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      },
      pickupLocation: selectedSchedule,
      total: getTotalPrice(),
      orderDate: new Date().toISOString()
    };
    
    localStorage.setItem('orderData', JSON.stringify(orderData));

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
        receipt_email: formData.email,
        payment_method_data: {
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: {
              country: 'US',
            },
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      // Payment succeeded, send confirmation email
      try {
        const paymentIntent = await stripe.retrievePaymentIntent(clientSecret);
        if (paymentIntent.paymentIntent) {
          // Send order confirmation email
          const emailResponse = await fetch('/api/send-order-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.paymentIntent.id,
            }),
          });

          if (emailResponse.ok) {
            console.log('Order confirmation email sent successfully');
          } else {
            console.error('Failed to send order confirmation email');
          }
        }
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
      }

      toast({
        title: "Payment Successful",
        description: "Your order has been placed successfully!",
      });
      clearCart();
      
      // Navigate to order confirmation page
      navigate('/order-confirmation?payment_intent=pi_test_success&payment_intent_client_secret=test_secret&redirect_status=succeeded');
    }
  };

  const updateFormData = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedSchedule = schedules.find(s => s.id.toString() === formData.pickupLocation);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            <div className={`ml-2 text-sm ${
              step <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {step === 1 && 'Pickup Location'}
              {step === 2 && 'Customer Info'}
              {step === 3 && 'Payment'}
            </div>
            {step < 3 && (
              <div className={`w-16 h-0.5 ml-4 ${
                step < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Pickup Location */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Select Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={formData.pickupLocation}
                  onValueChange={(value) => updateFormData('pickupLocation', value)}
                >
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value={schedule.id.toString()} id={`location-${schedule.id}`} />
                      <Label htmlFor={`location-${schedule.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{schedule.location}</div>
                        <div className="text-sm text-muted-foreground">{schedule.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.dayOfWeek} • {schedule.startTime} - {schedule.endTime}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Customer Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    required
                  />
                </div>

                {selectedSchedule && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Pickup Location:</h4>
                    <div className="text-sm">
                      <div className="font-medium">{selectedSchedule.location}</div>
                      <div className="text-muted-foreground">{selectedSchedule.address}</div>
                      <div className="text-muted-foreground">
                        {selectedSchedule.dayOfWeek} • {selectedSchedule.startTime} - {selectedSchedule.endTime}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <PaymentElement 
                    options={{
                      paymentMethodOrder: ['card'],
                      defaultValues: {
                        billingDetails: {
                          address: {
                            country: 'US',
                          },
                        },
                      },
                      fields: {
                        billingDetails: {
                          address: {
                            country: 'never',
                            line1: 'auto',
                            line2: 'auto',
                            city: 'auto',
                            state: 'auto',
                            postalCode: 'auto',
                          },
                        },
                      },
                      layout: {
                        type: 'accordion',
                        defaultCollapsed: false,
                        radios: false,
                        spacedAccordionItems: false,
                      },
                    }}
                  />
                  
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Order Summary:</h4>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">Customer: {formData.firstName} {formData.lastName}</div>
                      <div className="text-muted-foreground">Email: {formData.email}</div>
                      <div className="text-muted-foreground">Phone: {formData.phone}</div>
                      {selectedSchedule && (
                        <div className="text-muted-foreground">
                          Pickup: {selectedSchedule.location} - {selectedSchedule.dayOfWeek}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleStepBack} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" disabled={!stripe || isProcessing} className="flex-1">
                      {isProcessing ? 'Processing...' : `Pay $${getTotalPrice().toFixed(2)}`}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons for Steps 1 & 2 */}
          {currentStep < 3 && (
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleStepBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button onClick={handleStepNext} className="flex-1">
                Continue
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(item.product.price?.replace('$', '') || '0').toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-medium">
                    ${(parseFloat(item.product.price?.replace('$', '') || '0') * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back to Cart Link */}
      <div className="text-center">
        <Link href="/cart">
          <a className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Cart
          </a>
        </Link>
      </div>
    </div>
  );
};

export default function Checkout() {
  const { items, getTotalPrice } = useCart();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (items.length === 0) return;

    const totalAmount = getTotalPrice();
    
    // Stripe requires minimum 50 cents for USD
    if (totalAmount < 0.50) {
      console.error("Amount too small for Stripe:", totalAmount);
      return;
    }

    // Create PaymentIntent when component loads
    apiRequest("POST", "/api/create-payment-intent", { 
      items: items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price?.replace('$', '') || '0'),
        quantity: item.quantity
      })),
      amount: totalAmount,

    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
      });
  }, [items, getTotalPrice]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <Card>
          <CardContent className="pt-6">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">
              Add some items to your cart before checking out.
            </p>
            <Link href="/market">
              <a>
                <Button>Continue Shopping</Button>
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    const totalAmount = getTotalPrice();
    
    // Show error if amount is too small
    if (totalAmount > 0 && totalAmount < 0.50) {
      return (
        <div className="max-w-2xl mx-auto p-4 text-center">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">Order Total Too Small</h2>
              <p className="text-muted-foreground mb-4">
                Your order total of ${totalAmount.toFixed(2)} is below the minimum of $0.50 required for payment processing.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please add more items to your cart to reach the minimum order amount.
              </p>
              <Link href="/cart">
                <a>
                  <Button>Return to Cart</Button>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-muted-foreground">Setting up checkout...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}