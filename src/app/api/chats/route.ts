import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Chat from "@/models/Chat";

const DEMO_USER_ID = "demo-user";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Fetch all chats for the demo user, sorted by newest first
    const chats = await Chat.find({ userId: DEMO_USER_ID })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
