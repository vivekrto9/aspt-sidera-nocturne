import type { APIRoute } from "astro";
import { getCommerceOrder } from "../../../../../server/aggregator/commerce-orders.ts";
import { safeString } from "../../../../../server/aggregator/runtime.ts";
import { getWalletRecharge } from "../../../../../server/aggregator/wallet-store.ts";
import { getRuntimeEnv } from "../../../../../server/generated-site/request.ts";
import {
  errorResponse,
  jsonResponse,
} from "../../../../../server/generated-site/responses.ts";

const feature = "astropages.payment-status";

export const GET: APIRoute = async (context) => {
  const env = await getRuntimeEnv(context);
  if (!env.DB) return errorResponse(feature, "Database is unavailable.", 500);

  const payableType = safeString(
    context.url.searchParams.get("payableType") || "wallet_recharge",
  );
  const payableId = safeString(
    context.url.searchParams.get("payableId") ||
      context.url.searchParams.get("orderId") ||
      context.url.searchParams.get("rechargeId"),
  );

  if (!payableId) return errorResponse(feature, "payableId is required.", 400);

  if (payableType === "wallet_recharge") {
    const recharge = await getWalletRecharge(env, payableId);
    if (!recharge)
      return errorResponse(feature, "Wallet recharge was not found.", 404);
    return jsonResponse({
      status: "ready",
      state: "ready",
      feature,
      capabilityKey: "checkout-and-payments",
      message: "Payment status is available.",
      data: {
        payableType: "wallet_recharge",
        payableId: recharge.id,
        orderId: recharge.id,
        orderNumber: recharge.id,
        paymentState: recharge.paymentState,
      },
    });
  }

  const order = await getCommerceOrder(env, payableId);
  if (!order)
    return errorResponse(feature, "Payment target was not found.", 404);

  return jsonResponse({
    status: "ready",
    state: "ready",
    feature,
    capabilityKey: "checkout-and-payments",
    message: "Payment status is available.",
    data: {
      payableType: order.orderType,
      payableId: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentState:
        order.status === "pending_payment" ? "pending" : order.status,
    },
  });
};
