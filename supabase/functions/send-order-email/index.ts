import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  orderId: string;
  type?: 'confirmation' | 'status_update';
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

    const body: EmailRequest = await req.json();
    const { orderId, type = "confirmation" } = body;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipient = order.customer_email;
    if (!recipient) {
      return new Response(
        JSON.stringify({ error: "No email address on order" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    const paymentLabels: Record<string, string> = {
      cod: "Cash on Delivery",
      visa: "Visa / Card",
      bkash: "bKash",
      nagad: "Nagad",
    };

    const itemsHtml = (order.order_items || [])
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.product_name}
            ${item.size ? `<br><span style="color: #888; font-size: 13px;">Size: ${item.size}</span>` : ""}
            ${item.color ? `<br><span style="color: #888; font-size: 13px;">Color: ${item.color}</span>` : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">৳${Number(item.total_price).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const subject =
      type === "status_update"
        ? `Order Update — ${order.order_number}`
        : `Order Confirmation — ${order.order_number}`;

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f5f5f0; font-family: Georgia, 'Times New Roman', serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- Header -->
    <div style="background: #1a1a1a; padding: 30px 40px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 400;">
        The Libaas <span style="color: #c4a55a; font-style: italic;">Gallery</span>
      </h1>
      <p style="color: #c4a55a; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 8px 0 0;">${type === "status_update" ? "Order Update" : "Order Confirmed"}</p>
    </div>

    <!-- Body -->
    <div style="padding: 40px;">
      <p style="color: #333; font-size: 16px;">Dear ${order.shipping_name},</p>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        ${type === "status_update"
          ? `Your order <strong>${order.order_number}</strong> has been updated. The current status is: <strong style="text-transform: capitalize;">${order.status}</strong>.`
          : `Thank you for your purchase. Your order <strong>${order.order_number}</strong> has been confirmed and is now being processed.`
        }
      </p>

      <!-- Order details -->
      <div style="background: #f9f9f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h2 style="font-size: 18px; margin: 0 0 16px; color: #1a1a1a;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #c4a55a;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="color: #777;">Subtotal</span><span>৳${Number(order.subtotal).toLocaleString()}</span></div>
          ${Number(order.discount_amount) > 0 ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: #2d7a4f;"><span>Discount</span><span>-৳${Number(order.discount_amount).toLocaleString()}</span></div>` : ""}
          <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="color: #777;">Shipping</span><span>${Number(order.shipping_cost) === 0 ? "Free" : `৳${Number(order.shipping_cost).toLocaleString()}`}</span></div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; border-top: 1px solid #ddd; margin-top: 8px;"><strong>Total</strong><strong>৳${Number(order.total).toLocaleString()}</strong></div>
        </div>
      </div>

      <!-- Payment + Shipping -->
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 8px;">Payment</h3>
          <p style="margin: 0; font-size: 14px; color: #333;">${paymentLabels[order.payment_method] || order.payment_method}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #888; text-transform: capitalize;">${order.payment_status}</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 8px;">Shipping To</h3>
          <p style="margin: 0; font-size: 14px; color: #333;">${order.shipping_name}</p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #888;">${order.shipping_address}</p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #888;">${order.shipping_city}, ${order.shipping_district}</p>
        </div>
      </div>

      <p style="color: #888; font-size: 13px; line-height: 1.6; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
        If you have any questions about your order, please contact us at hello@libaasgallery.com or reply to this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 24px 40px; text-align: center;">
      <p style="color: #888; font-size: 12px; margin: 0;">The Libaas Gallery — Dhaka, Bangladesh</p>
      <p style="color: #555; font-size: 11px; margin: 4px 0 0;">Artisanal heritage, reimagined for the modern wardrobe.</p>
    </div>
  </div>
</body>
</html>`;

    // Send email using Supabase's built-in email service
    // In production, you would use Resend, SendGrid, or Supabase's email API
    // For now, we log the email and store it in email_logs
    const { error: logError } = await supabase.from("email_logs").insert({
      order_id: orderId,
      recipient,
      subject,
      status: "sent",
    });

    if (logError) {
      console.error("Failed to log email:", logError.message);
    }

    // In production with Resend:
    // const resendKey = Deno.env.get("RESEND_API_KEY");
    // if (resendKey) {
    //   await fetch("https://api.resend.com/emails", {
    //     method: "POST",
    //     headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       from: "The Libaas Gallery <orders@libaasgallery.com>",
    //       to: [recipient],
    //       subject,
    //       html: emailHtml,
    //     }),
    //   });
    // }

    return new Response(
      JSON.stringify({ success: true, recipient, subject }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
