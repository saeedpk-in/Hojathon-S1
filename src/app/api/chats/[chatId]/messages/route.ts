import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

const DEMO_USER_ID = "demo-user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify the chat actually belongs to the demo user (Security Requirement #13)
    const chat = await Chat.findOne({ chatId, userId: DEMO_USER_ID });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
    }

    // Fetch messages for this chat chronologically
    const messages = await Message.find({ chatId, userId: DEMO_USER_ID })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
