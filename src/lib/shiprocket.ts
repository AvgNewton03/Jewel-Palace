export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number | string;
}

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string | number;
  billing_state: string;
  billing_country?: string;
  billing_email: string;
  billing_phone: string | number;
  shipping_is_billing?: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

/**
 * Authenticates with Shiprocket API and returns an authentication token.
 * Uses SHIPROCKET_API_EMAIL and SHIPROCKET_API_PASSWORD environment variables.
 */
export async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Shiprocket credentials missing: SHIPROCKET_API_EMAIL and SHIPROCKET_API_PASSWORD must be configured in environment variables.'
    );
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Shiprocket auth failed (${response.status} ${response.statusText}): ${errorBody}`);
  }

  const data = await response.json();

  if (!data?.token) {
    throw new Error('Shiprocket auth response did not include a valid token.');
  }

  return data.token;
}

/**
 * Creates an adhoc order in Shiprocket for automated shipping.
 * Maps Firestore order data to Shiprocket's required order schema.
 *
 * @param orderData Firestore order document data
 * @param token Shiprocket Bearer authentication token
 */
export async function createShiprocketOrder(orderData: any, token: string): Promise<any> {
  if (!token) {
    throw new Error('Authentication token is required to create a Shiprocket order.');
  }

  // 1. Order ID: Document ID, razorpayOrderId, or fallback ID
  const orderId = String(
    orderData?.id ||
    orderData?.documentId ||
    orderData?.orderId ||
    orderData?.razorpayOrderId ||
    `ORDER_${Date.now()}`
  );

  // 2. Order Date: Current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // 3. Billing details extraction with comprehensive fallbacks
  const extractedName =
    orderData?.billing_customer_name ||
    orderData?.customerName ||
    orderData?.name ||
    (orderData?.firstName
      ? `${orderData.firstName} ${orderData.lastName || ''}`.trim()
      : '') ||
    (orderData?.shippingInfo?.firstName
      ? `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName || ''}`.trim()
      : '') ||
    orderData?.shippingAddress?.name ||
    'Customer';
  const billingCustomerName = String(extractedName).trim() || 'Customer';


  const billingAddress =
    orderData?.billing_address ||
    orderData?.address ||
    orderData?.shippingInfo?.address ||
    orderData?.shippingAddress?.address ||
    '';

  const billingCity =
    orderData?.billing_city ||
    orderData?.city ||
    orderData?.shippingInfo?.city ||
    orderData?.shippingAddress?.city ||
    '';

  const billingPincode =
    orderData?.billing_pincode ||
    orderData?.pincode ||
    orderData?.postalCode ||
    orderData?.shippingInfo?.pincode ||
    orderData?.shippingAddress?.pincode ||
    '';

  const billingState =
    orderData?.billing_state ||
    orderData?.state ||
    orderData?.shippingInfo?.state ||
    orderData?.shippingAddress?.state ||
    '';

  const billingEmail =
    orderData?.billing_email ||
    orderData?.email ||
    orderData?.customerEmail ||
    orderData?.shippingInfo?.email ||
    orderData?.shippingAddress?.email ||
    '';

  const billingPhone =
    orderData?.billing_phone ||
    orderData?.phone ||
    orderData?.phoneNumber ||
    orderData?.contact ||
    orderData?.shippingInfo?.phone ||
    orderData?.shippingAddress?.phone ||
    '';

  // 4. Map items to Shiprocket order_items format
  const rawItems: any[] = Array.isArray(orderData?.items) ? orderData.items : [];
  const orderItems: ShiprocketOrderItem[] = rawItems.map((item: any, idx: number) => {
    const name = item.name || item.title || `Item ${idx + 1}`;
    const sku = item.sku || item.productId || item.product || item.id || `SKU-${idx + 1}`;
    const units = Number(item.units || item.quantity || item.qty || 1);
    const sellingPrice = Number(item.selling_price || item.price || 0);

    return {
      name,
      sku: String(sku),
      units,
      selling_price: sellingPrice,
    };
  });

  // Calculate subtotal if not directly provided
  const itemsSubtotal = orderItems.reduce(
    (sum, item) => sum + item.selling_price * item.units,
    0
  );
  const subTotal = Number(orderData?.totalAmount || orderData?.amount || itemsSubtotal || 0);

  // 5. Construct Shiprocket adhoc payload
  const payload: ShiprocketOrderPayload = {
    order_id: orderId,
    order_date: currentDate,
    pickup_location: 'Primary',
    billing_customer_name: billingCustomerName,
    billing_address: billingAddress,
    billing_city: billingCity,
    billing_pincode: billingPincode,
    billing_state: billingState,
    billing_country: 'India',
    billing_email: billingEmail,
    billing_phone: billingPhone,
    shipping_is_billing: true,
    payment_method: 'Prepaid',
    order_items: orderItems,
    sub_total: subTotal,
    length: 10,
    breadth: 10,
    height: 5,
    weight: 0.5,
  };

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      `Shiprocket order creation failed (${response.status} ${response.statusText}): ${JSON.stringify(responseData)}`
    );
  }

  return responseData;
}
