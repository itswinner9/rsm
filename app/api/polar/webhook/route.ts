import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type PolarSubscriptionWebhookData = {
  id: string;
  status: string;
  customerId: string;
  customer?: { externalId?: string | null };
  metadata?: Record<string, unknown>;
};

function userIdFromSubscription(sub: PolarSubscriptionWebhookData): string | null {
  const ext = sub.customer?.externalId;
  if (typeof ext === "string" && ext.length > 0) return ext;
  const meta = sub.metadata?.user_id;
  if (typeof meta === "string" && meta.length > 0) return meta;
  if (typeof meta === "number") return String(meta);
  return null;
}

function profileStatus(subStatus: string): string {
  if (subStatus === "active" || subStatus === "trialing") return "active";
  if (subStatus === "past_due") return "past_due";
  if (subStatus === "canceled") return "canceled";
  return "inactive";
}

async function applySubscription(supabase: SupabaseClient, sub: PolarSubscriptionWebhookData) {
  const userId = userIdFromSubscription(sub);
  if (!userId) {
    console.warn("[polar/webhook] No user id on subscription", sub.id);
    return;
  }
  await supabase
    .from("user_profiles")
    .update({
      subscription_status: profileStatus(sub.status),
      polar_customer_id: sub.customerId,
      polar_subscription_id: sub.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export async function POST(request: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("POLAR_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error("Supabase service client unavailable (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(rawBody, headers, secret);
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    console.error("Polar webhook verify error:", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "order.paid": {
        const order = event.data;
        if (!order.paid) break;
        const ext = order.customer?.externalId;
        const meta = order.metadata?.user_id;
        const userId =
          typeof ext === "string" && ext.length > 0
            ? ext
            : typeof meta === "string"
              ? meta
              : typeof meta === "number"
                ? String(meta)
                : null;
        if (!userId || !order.subscriptionId) break;
        await supabase
          .from("user_profiles")
          .update({
            subscription_status: "active",
            polar_customer_id: order.customerId,
            polar_subscription_id: order.subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        break;
      }
      case "customer.state_changed": {
        const st = event.data;
        const userId = typeof st.externalId === "string" && st.externalId.length > 0 ? st.externalId : null;
        if (!userId) break;
        const active = st.activeSubscriptions?.find(
          (s) => s.status === "active" || s.status === "trialing"
        );
        if (active) {
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: "active",
              polar_customer_id: st.id,
              polar_subscription_id: active.id,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }
      case "subscription.active":
      case "subscription.updated":
      case "subscription.uncanceled":
        await applySubscription(supabase, event.data);
        break;
      case "subscription.canceled":
      case "subscription.revoked": {
        const sub = event.data;
        const userId = userIdFromSubscription(sub);
        if (userId) {
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: event.type === "subscription.canceled" ? "canceled" : "inactive",
              polar_subscription_id: sub.id,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }
      case "subscription.past_due":
        await applySubscription(supabase, event.data);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("Polar webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
