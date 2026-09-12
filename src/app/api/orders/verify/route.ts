import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Message from "@/models/Message";
import Razorpay from "razorpay";

const DEMO_USER_ID = "demo-user";

export async function POST(req: NextRequest) {
  try {
    const { payment_link_id, chatId } = await req.json();

    if (!payment_link_id || !chatId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findOne({ razorpayLinkId: payment_link_id, userId: DEMO_USER_ID });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, order });
    }

    // Verify Razorpay setup
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!rzpKeyId || !rzpKeySecret) {
      return NextResponse.json({ error: "Razorpay credentials are missing." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret,
    });

    // Fetch the payment link status directly from Razorpay
    const paymentLinkReq = await razorpay.paymentLink.fetch(payment_link_id);

    if (paymentLinkReq.status === "paid") {
      // Update Order
      order.paymentStatus = "paid";
      order.orderStatus = "placed";
      await order.save();

      // Create Order Confirmation Message in Chat
      const expl = `Order Confirmed!\n\nOrder #${order.orderId}\nPayment: Paid\nStatus: Order placed\n\nDelivering to:\n${order.deliveryAddress.name}\n${order.deliveryAddress.city}, ${order.deliveryAddress.state}\n${order.deliveryAddress.pincode}`;

      try {
        await Message.create({
          chatId,
          userId: DEMO_USER_ID,
          role: "assistant",
          content: expl,
          product: order.product,
        });
      } catch (err) {
        console.error("Error saving order confirmation message:", err);
      }

      return NextResponse.json({ success: true, order, message: expl });
    }

    return NextResponse.json({ success: false, status: paymentLinkReq.status, order });

  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
