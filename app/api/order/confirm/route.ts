import { NextRequest, NextResponse } from "next/server";
import { verifyAndWriteOrder } from "@/lib/order";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, items, address, phone, amount, txRef, transactionId } = body;
    const currency = body.currency === "NGN" ? "NGN" : "USD";

    if (!uid || !items?.length || !address || !phone || !amount || !txRef || !transactionId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const result = await verifyAndWriteOrder({ uid, items, address, phone, amount, currency, txRef, transactionId });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, orderId: result.orderId, duplicate: result.duplicate });
  } catch (err) {
    console.error("Order confirmation failed:", err);
    return NextResponse.json({ error: "Something went wrong confirming your order." }, { status: 500 });
  }
}