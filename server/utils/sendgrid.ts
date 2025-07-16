import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  pickupLocation: string;
  pickupInstructions: string;
  orderDate: string;
  paymentIntentId: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const itemsHtml = data.orderItems
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Little Way Acres</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2c5530; margin: 0; font-size: 24px;">Order Confirmation</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Thank you for your order from Little Way Acres!</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p>Hello ${data.customerName},</p>
          <p>Your order has been successfully processed. Here are the details:</p>
        </div>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #2c5530; margin-top: 0; font-size: 18px;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px 8px; text-align: right; border-top: 2px solid #ddd;">Order Total:</td>
                <td style="padding: 12px 8px; text-align: right; border-top: 2px solid #ddd;">$${data.orderTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #2c5530; margin-top: 0; font-size: 18px;">Pickup Information</h2>
          <p><strong>Location:</strong> ${data.pickupLocation}</p>
          <p><strong>Pickup Hours:</strong> 10:00 AM - 1:00 PM</p>
          <p><strong>Instructions:</strong> ${data.pickupInstructions}</p>
        </div>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #2c5530; margin-top: 0; font-size: 18px;">Order Details</h2>
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Payment ID:</strong> ${data.paymentIntentId}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <p>Thank you for supporting Little Way Acres!</p>
          <p>If you have any questions, please contact us at <a href="mailto:littlewayacresmi@gmail.com">littlewayacresmi@gmail.com</a></p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Order Confirmation - Little Way Acres

Hello ${data.customerName},

Your order has been successfully processed. Here are the details:

ORDER SUMMARY:
${data.orderItems.map(item => `${item.name} x${item.quantity} - $${(item.quantity * item.price).toFixed(2)}`).join('\n')}

Order Total: $${data.orderTotal.toFixed(2)}

PICKUP INFORMATION:
Location: ${data.pickupLocation}
Pickup Hours: 10:00 AM - 1:00 PM
Instructions: ${data.pickupInstructions}

ORDER DETAILS:
Order Date: ${data.orderDate}
Payment ID: ${data.paymentIntentId}

Thank you for supporting Little Way Acres!

If you have any questions, please contact us at littlewayacresmi@gmail.com
    `;

    const msg = {
      to: data.customerEmail,
      from: {
        email: 'littlewayacresmi@gmail.com',
        name: 'LWA'
      },
      subject: `Order Confirmation - Little Way Acres`,
      text: textContent,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log('Order confirmation email sent successfully to:', data.customerEmail);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}