import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  orderId: string;
  method: 'cod' | 'visa' | 'bkash' | 'nagad';
  amount: number;
  currency?: string;
  // For bKash/Nagad
  mobileNumber?: string;
  trxId?: string;
  // For Visa/Stripe — would use Stripe Payment Intent in production
  cardToken?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body: PaymentRequest = await req.json();
    const { orderId, method, amount } = body;

    if (!orderId || !method || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_status, payment_method")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ error: "Order already paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: { status: string; reference: string; details: any };

    switch (method) {
      case "cod": {
        // Cash on delivery — no payment processing needed
        result = {
          status: "pending",
          reference: `COD-${order.order_number}`,
          details: { method: "cod", note: "Payment due on delivery" },
        };
        break;
      }

      case "bkash": {
        // bKash payment verification
        // In production, this would call bKash API to verify the transaction ID
        // For now, we validate the format and store the transaction reference
        if (!body.trxId || !body.mobileNumber) {
          return new Response(
            JSON.stringify({ error: "bKash transaction ID and mobile number required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Validate Bangladeshi mobile number format
        if (!/^01[3-9]\d{8}$/.test(body.mobileNumber)) {
          return new Response(
            JSON.stringify({ error: "Invalid mobile number format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Validate transaction ID format (alphanumeric, 8-20 chars)
        if (!/^[A-Za-z0-9]{8,20}$/.test(body.trxId)) {
          return new Response(
            JSON.stringify({ error: "Invalid transaction ID format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // In production: call bKash payment verification API here
        // const bkashResponse = await verifyBkashPayment(body.trxId, amount);
        result = {
          status: "pending",
          reference: body.trxId,
          details: {
            method: "bkash",
            mobile: body.mobileNumber,
            trxId: body.trxId,
            amount,
            verified: false, // Would be true after API verification
            note: "Awaiting manual verification",
          },
        };
        break;
      }

      case "nagad": {
        // Nagad payment verification (same pattern as bKash)
        if (!body.trxId || !body.mobileNumber) {
          return new Response(
            JSON.stringify({ error: "Nagad transaction ID and mobile number required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!/^01[3-9]\d{8}$/.test(body.mobileNumber)) {
          return new Response(
            JSON.stringify({ error: "Invalid mobile number format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!/^[A-Za-z0-9]{8,20}$/.test(body.trxId)) {
          return new Response(
            JSON.stringify({ error: "Invalid transaction ID format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = {
          status: "pending",
          reference: body.trxId,
          details: {
            method: "nagad",
            mobile: body.mobileNumber,
            trxId: body.trxId,
            amount,
            verified: false,
            note: "Awaiting manual verification",
          },
        };
        break;
      }

      case "visa": {
        // Visa/Card payment via Stripe
        // In production, this would create/confirm a Stripe Payment Intent
        // const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        // const intent = await fetch("https://api.stripe.com/v1/payment_intents/confirm", ...);
        if (!body.cardToken) {
          return new Response(
            JSON.stringify({ error: "Card token required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // For now, mark as pending (Stripe integration requires secret key)
        result = {
          status: "pending",
          reference: `CARD-${Date.now()}`,
          details: {
            method: "visa",
            cardToken: body.cardToken,
            amount,
            verified: false,
            note: "Card payment awaiting Stripe integration",
          },
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid payment method" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Update the order with payment reference and details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_reference: result.reference,
        payment_details: result.details,
        payment_status: result.status,
      })
      .eq("id", orderId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update order payment info" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentStatus: result.status,
        reference: result.reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Payment processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
