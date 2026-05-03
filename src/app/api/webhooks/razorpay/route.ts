import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin (Ensures it doesn't re-initialize on every request)
initAdmin();
const db = getFirestore();

export async function POST(req: Request) {
  try {
    // 1. Get raw body and signature
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // 2. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid Razorpay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // 3. Process the 'payment.captured' event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id; 

      // Query the order by razorpay_order_id
      const ordersRef = db.collection('orders');
      const querySnapshot = await ordersRef.where('razorpayOrderId', '==', razorpayOrderId).limit(1).get();

      if (querySnapshot.empty) {
        console.error('Order not found for Razorpay Order ID:', razorpayOrderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const orderDoc = querySnapshot.docs[0];
      const orderData = orderDoc.data();

      // Initialize a Firestore batch for atomic operations
      const batch = db.batch();

      // Step A: Update the order status to 'paid'
      batch.update(orderDoc.ref, {
        status: 'paid',
        paymentId: payment.id,
        updatedAt: FieldValue.serverTimestamp()
      });

      // Step B: Decrement the stock_count for each product in the order
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          // Support both productId/quantity and product/qty naming conventions
          const id = item.productId || item.product;
          const qty = item.quantity || item.qty;
          
          if (id && qty) {
            const productRef = db.collection('products').doc(id);
            
            // Use FieldValue.increment with a negative value to safely decrement stock
            batch.update(productRef, {
              stock_count: FieldValue.increment(-qty)
            });
          }
        }
      }

      // Commit the batch operation
      await batch.commit();
      console.log(`Successfully processed payment for order: ${razorpayOrderId}`);
    }

    // 4. Trigger success response to Razorpay
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
