import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin, getPolar } from "@/lib/polar/server";

function productIdForPlan(plan: "pro" | "recruiting"): string | null {
  if (plan === "pro") {
    return process.env.POLAR_PRODUCT_ID_PRO?.trim() || null;
  }
  return process.env.POLAR_PRODUCT_ID_RECRUITING?.trim() || null;
}

export async function POST(request: NextRequest) {
  if (!process.env.POLAR_ACCESS_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "Billing is not configured. Set POLAR_ACCESS_TOKEN in your environment." },
      { status: 500 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan: "pro" | "recruiting" = "pro";
  try {
    const body = await request.json();
    if (body?.plan === "recruiting") plan = "recruiting";
  } catch {
    /* empty */
  }

  const productId = productIdForPlan(plan);
  if (!productId) {
    return NextResponse.json(
      {
        error:
          plan === "pro"
            ? "Set POLAR_PRODUCT_ID_PRO to your Polar product ID (Dashboard → Products)."
            : "Set POLAR_PRODUCT_ID_RECRUITING to your Polar product ID (Dashboard → Products).",
      },
      { status: 500 }
    );
  }

  const origin = getAppOrigin(request);
  const successUrl = `${origin}/dashboard?success=true&checkout_id={CHECKOUT_ID}`;
  const returnUrl = `${origin}/pricing`;

  try {
    const polar = getPolar();
    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: user.email ?? undefined,
      externalCustomerId: user.id,
      metadata: { user_id: user.id, plan },
      successUrl,
      returnUrl,
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Checkout created but no URL was returned." },
        { status: 500 }
      );
    }

    if (checkout.customerId) {
      await supabase
        .from("user_profiles")
        .update({
          polar_customer_id: checkout.customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    console.error("Polar checkout error:", e);
    const message = e instanceof Error ? e.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
