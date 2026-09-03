import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getShiprocketToken, createShiprocketOrder } from '@/lib/shiprocket';
import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  writeBatch, 
  doc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore/lite';

export async function POST(req: Request) {
  try {
    // 1. Get raw body and signature
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // 2. Verify Razorpay signature using timing-safe comparison
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );

    if (!isMatch) {
      console.error('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // 3. Process the 'payment.captured' or 'order.paid' event
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;
      const razorpayOrderId = payment?.order_id || order?.id;

      if (!razorpayOrderId) {
        console.warn('Webhook received without associated razorpayOrderId');
        return NextResponse.json({ status: 'ignored_no_order_id' }, { status: 200 });
      }

      // Query the order by razorpayOrderId
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('razorpayOrderId', '==', razorpayOrderId), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error('Order not found for Razorpay Order ID:', razorpayOrderId);
        // Return 200 so Razorpay does not retry endlessly for a non-existent DB order
        return NextResponse.json({ error: 'Order not found in DB' }, { status: 200 });
      }

      const orderDoc = querySnapshot.docs[0];
      const orderData = orderDoc.data();

      // IDEMPOTENCY CHECK: If already paid, acknowledge without re-decrementing inventory
      if (orderData.status === 'paid') {
        console.log(`Order ${razorpayOrderId} is already processed. Skipping duplicate execution.`);
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }

      // Initialize atomic batch
      const batch = writeBatch(db);

      // Step A: Mark order paid
      batch.update(orderDoc.ref, {
        status: 'paid',
        paymentId: payment?.id || null,
        updatedAt: serverTimestamp(),
      });

      // Step B: Decrement inventory safely
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          const id = item.productId || item.product;
          const qty = item.quantity || item.qty;

          if (id && qty) {
            const productRef = doc(db, 'products', id);
            batch.update(productRef, {
              stock_count: increment(-Number(qty)),
            });
          }
        }
      }

      await batch.commit();
      console.log(`Successfully confirmed payment and updated stock for: ${razorpayOrderId}`);

      // Step C: Automated shipping via Shiprocket (Non-blocking)
      try {
        if (process.env.ENABLE_SHIPROCKET === 'true') {
          const token = await getShiprocketToken();
          const shiprocketResult = await createShiprocketOrder(
            { id: orderDoc.id, ...orderData },
            token
          );
          console.log(
            'Shiprocket order created successfully. Order ID:',
            shiprocketResult?.order_id || shiprocketResult?.shipment_id || razorpayOrderId
          );
        }
      } catch (shiprocketError) {
        console.error('Shiprocket order creation failed:', shiprocketError);
      }
    }

    // Return 200 OK to acknowledge event
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook handling error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}