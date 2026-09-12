import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

const DEMO_USER_ID = "demo-user";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Fetch all orders for the demo user, sorted by newest first
    const orders = await Order.find({ userId: DEMO_USER_ID })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
