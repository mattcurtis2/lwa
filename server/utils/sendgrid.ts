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
  console.log('=== SENDGRID EMAIL ATTEMPT ===');
  console.log('SendGrid API Key exists:', !!process.env.SENDGRID_API_KEY);
  console.log('API Key starts with:', process.env.SENDGRID_API_KEY?.substring(0, 8) + '...');
  console.log('Customer Email:', data.customerEmail);
  console.log('Order Items:', data.orderItems);
  console.log('Order Total:', data.orderTotal);
  
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
        <h1 style="color: #2c5530;">Order Confirmation - Little Way Acres</h1>
        
        <p>${data.customerName.split(' ')[0]}, thank you for your order!</p>
        
        <h2 style="color: #2c5530;">Order Summary</h2>
        ${data.orderItems.map(item => `
          <p>${item.quantity} ${item.name} - $${(item.quantity * item.price).toFixed(2)}</p>
        `).join('')}
        <p><strong>Order Total: $${data.orderTotal.toFixed(2)}</strong></p>
        
        <h2 style="color: #2c5530;">Pickup Information</h2>
        <p><strong>Location:</strong> ${data.pickupLocation}</p>
        <p><strong>Pickup Hours:</strong> ${data.pickupLocation.includes('Muskegon') ? '8:00 AM - 1:00 PM' : '10:00 AM - 1:00 PM'}</p>
        <p><strong>Instructions:</strong> ${data.pickupLocation.includes('Muskegon') ? 'Look for the Little Way Acres stand. We are usually placed in a spot between 59-57.' : data.pickupInstructions}</p>
        
        <h2 style="color: #2c5530;">Order Details</h2>
        <p><strong>Order Date:</strong> ${data.orderDate}</p>
        
        <p>Thank you for supporting Little Way Acres!</p>
        <p>Questions? Contact: littlewayacresmi@gmail.com</p>
      </div>
    `;

    const textContent = `
Order Confirmation - Little Way Acres

${data.customerName.split(' ')[0]}, thank you for your order!

ORDER SUMMARY:
${data.orderItems.map(item => `${item.quantity} ${item.name} - $${(item.quantity * item.price).toFixed(2)}`).join('\n')}

Order Total: $${data.orderTotal.toFixed(2)}

PICKUP INFORMATION:
Location: ${data.pickupLocation}
Pickup Hours: ${data.pickupLocation.includes('Muskegon') ? '8:00 AM - 1:00 PM' : '10:00 AM - 1:00 PM'}
Instructions: ${data.pickupLocation.includes('Muskegon') ? 'Look for the Little Way Acres stand. We are usually placed in a spot between 59-57.' : data.pickupInstructions}

ORDER DETAILS:
Order Date: ${data.orderDate}

Thank you for supporting Little Way Acres!

If you have any questions, please contact us at littlewayacresmi@gmail.com
    `;

    const msg = {
      to: data.customerEmail,
      from: 'littlewayacresmi@gmail.com',
      subject: `Order Confirmation - Little Way Acres`,
      text: textContent,
      html: htmlContent,
    };

    console.log('Prepared email message:', JSON.stringify(msg, null, 2));
    console.log('Attempting to send email...');

    await sgMail.send(msg);
    console.log('✅ Order confirmation email sent successfully to:', data.customerEmail);
    return true;
  } catch (error: any) {
    console.error('❌ SendGrid email error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response body:', error.response.body);
      
      if (error.response.body && error.response.body.errors) {
        console.error('Detailed errors:', JSON.stringify(error.response.body.errors, null, 2));
      }
    }
    
    return false;
  }
}