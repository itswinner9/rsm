import type Stripe from "stripe";

/**
 * Catalog Prices can have `recurring.trial_period_days` set in the Stripe Dashboard. Checkout
 * then shows a free trial and $0 due today even when the app does not pass
 * `subscription_data.trial_period_days`. Replacing those items with inline `price_data` on the
 * same product and amount avoids the hosted trial UI and charges on the normal billing cadence.
 */
export async function expandCatalogLineItemsToDropPriceTrial(
  stripe: Stripe,
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
): Promise<{
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  strippedTrialFromCatalogPrice: boolean;
}> {
  const out: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let strippedTrialFromCatalogPrice = false;

  for (const item of lineItems) {
    const priceId = typeof item.price === "string" ? item.price : null;
    if (!priceId) {
      out.push(item);
      continue;
    }

    let price: Stripe.Price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (e) {
      console.error(`[stripe/checkout] failed to retrieve ${priceId} for trial check:`, e);
      out.push(item);
      continue;
    }

    const trialDays = price.recurring?.trial_period_days;
    if (trialDays == null || trialDays === 0) {
      out.push(item);
      continue;
    }

    if (price.type !== "recurring" || !price.recurring) {
      out.push(item);
      continue;
    }

    if (price.recurring.usage_type === "metered") {
      console.warn(
        `[stripe/checkout] Price ${priceId} has trial_period_days=${trialDays} but is metered; cannot auto-convert. Remove the trial on this Price in the Stripe Dashboard.`
      );
      out.push(item);
      continue;
    }

    if (price.billing_scheme !== "per_unit") {
      console.warn(
        `[stripe/checkout] Price ${priceId} has trial_period_days=${trialDays} but billing_scheme=${price.billing_scheme}; cannot auto-convert. Remove the trial on this Price in the Stripe Dashboard.`
      );
      out.push(item);
      continue;
    }

    const productId =
      typeof price.product === "string" ? price.product : price.product?.id;
    if (!productId) {
      out.push(item);
      continue;
    }

    const unitOk =
      price.unit_amount != null ||
      (price.unit_amount_decimal != null && price.unit_amount_decimal.length > 0);
    if (!unitOk) {
      console.warn(
        `[stripe/checkout] Price ${priceId} has trial_period_days=${trialDays} but no unit amount; cannot auto-convert. Remove the trial on this Price in the Stripe Dashboard.`
      );
      out.push(item);
      continue;
    }

    console.warn(
      `[stripe/checkout] Price ${priceId} has recurring.trial_period_days=${trialDays}; using inline price_data on product ${productId} so Checkout charges immediately. For a single catalog Price ID in Stripe, clear the trial on that Price (Product → Pricing → edit price).`
    );
    strippedTrialFromCatalogPrice = true;

    const price_data: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency: price.currency,
      product: productId,
      recurring: {
        interval: price.recurring.interval,
        ...(price.recurring.interval_count != null && price.recurring.interval_count > 1
          ? { interval_count: price.recurring.interval_count }
          : {}),
      },
      ...(price.tax_behavior != null ? { tax_behavior: price.tax_behavior } : {}),
    };

    if (price.unit_amount != null) {
      price_data.unit_amount = price.unit_amount;
    } else {
      price_data.unit_amount_decimal = price.unit_amount_decimal!;
    }

    out.push({
      quantity: item.quantity ?? 1,
      adjustable_quantity: item.adjustable_quantity,
      tax_rates: item.tax_rates,
      dynamic_tax_rates: item.dynamic_tax_rates,
      price_data,
    });
  }

  return { lineItems: out, strippedTrialFromCatalogPrice };
}
