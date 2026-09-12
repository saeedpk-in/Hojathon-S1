import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import connectToDatabase from "@/lib/mongoose";
import UserPreference from "@/models/UserPreference";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import Razorpay from "razorpay";

// Constants
const USD_TO_INR = 85;
const DEMO_USER_ID = "demo-user";

// Ensure keys are available
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
  try {
    const { message, chatId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    // Phase 6: Persistent Chat History - Save User Message
    if (chatId) {
      try {
        await connectToDatabase();
        
        // Lazy creation of Chat document
        const existingChat = await Chat.findOne({ chatId, userId: DEMO_USER_ID });
        if (!existingChat) {
          // Generate a simple title safely truncating the message
          const title = message.length > 30 ? message.substring(0, 30) + "..." : message;
          await Chat.create({ chatId, userId: DEMO_USER_ID, title });
        } else {
          existingChat.updatedAt = new Date();
          await existingChat.save();
        }

        // Save User Message
        await Message.create({
          chatId,
          userId: DEMO_USER_ID,
          role: "user",
          content: message,
        });

      } catch (err) {
        console.error("Error saving user message to history:", err);
      }
    }

    // Phase 3 & 5: Memory Lookup
    let userPref = null;
    if (chatId) {
      try {
        await connectToDatabase();
        userPref = await UserPreference.findOne({ chatId });
      } catch (e) {
        console.warn("DB connection failed or not configured, skipping memory lookup");
      }
    }

    // Configure the model for structured output
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            action: {
              type: SchemaType.STRING,
              description: "The user's intent. Use 'buy' ONLY if the user is explicitly confirming they want to purchase the previously suggested item (e.g., 'Yes buy it', 'I want this one'). Otherwise, default to 'search'.",
              enum: ["search", "buy"]
            },
            category: {
              type: SchemaType.STRING,
              description: "The product category extracted from the user's message.",
              enum: [
                "electronics",
                "jewelery",
                "men's clothing",
                "women's clothing"
              ]
            },
            budget: {
              type: SchemaType.NUMBER,
              description: "The maximum budget extracted from the user's message, in INR (Rupees). If no budget is specified, provide a high default like 999999."
            }
          },
          required: ["action", "category", "budget"],
        } as any,
      },
    });

    const prompt = `Analyze the following message (which may be in English, Malayalam, or a mix) and extract the intended action, product category, and the budget.
Valid categories are only: "electronics", "jewelery", "men's clothing", "women's clothing".
Map their intent to the closest matching valid category.
${userPref ? `\nPrevious Context: The user previously wanted category "${userPref.category}" under budget ${userPref.budget}. If they are just following up without specifying new ones, reuse these previous values! If they specify a new budget or category, extract the new ones.` : ''}

Message: "${message}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const { action, category, budget } = JSON.parse(responseText);

    // ==========================================
    // ACTION: BUY
    // ==========================================
    if (action === "buy") {
      if (!userPref || !userPref.lastSuggestedProduct || !userPref.lastSuggestedProduct.id) {
        const expl = "I don't have a specific product selected for you to buy yet. Please search for what you're looking for first!";
        
        try {
          await connectToDatabase();
          await Message.create({ chatId, userId: DEMO_USER_ID, role: "assistant", content: expl });
        } catch (e) {
          console.error("Error saving assistant empty buy message to history:", e);
        }

        return NextResponse.json({
          action: "buy",
          explanation: expl
        });
      }

      const product = userPref.lastSuggestedProduct;

      // Verify Razorpay setup
      const rzpKeyId = process.env.RAZORPAY_KEY_ID;
      const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!rzpKeyId || !rzpKeySecret) {
        return NextResponse.json(
          { error: "Server Configuration Error: Razorpay credentials are missing from environment variables." },
          { status: 500 }
        );
      }

      try {
        const razorpay = new Razorpay({
          key_id: rzpKeyId,
          key_secret: rzpKeySecret,
        });

        // Convert INR to paise (*100)
        const amountInPaise = Math.round(product.price * 100);

        if (amountInPaise <= 0) {
          throw new Error("Invalid product price");
        }

        const paymentLinkReq = await razorpay.paymentLink.create({
          amount: amountInPaise,
          currency: "INR",
          description: `Purchase of ${product.title}`,
          customer: {
            name: "Test Customer",
            email: "test@example.com",
            contact: "+919876543210"
          },
          notify: {
            sms: false,
            email: false
          },
          reminder_enable: false
        });

        const expl = "Great choice! Click the button below to complete your test payment securely.";

        // Save assistant message to history
        try {
          await connectToDatabase();
          await Message.create({
            chatId,
            userId: DEMO_USER_ID,
            role: "assistant",
            content: expl,
            product: product,
            paymentLink: paymentLinkReq.short_url,
          });
        } catch (err) {
          console.error("Error saving assistant buy message to history:", err);
        }

        return NextResponse.json({
          action: "buy",
          paymentLink: paymentLinkReq.short_url,
          selectedProduct: product,
          explanation: expl
        });

      } catch (err: any) {
        console.error("Razorpay error:", err);
        return NextResponse.json(
          { error: "Failed to generate payment link. Please try again.", details: err.error?.description || err.message || err },
          { status: 500 }
        );
      }
    }

    // ==========================================
    // ACTION: SEARCH
    // ==========================================
    if (!category || !budget) {
       return NextResponse.json(
        { error: "Could not successfully extract category and budget." },
        { status: 400 }
      );
    }

    // Call the external Fake Store API
    const apiUrl = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch from Fake Store API: ${apiResponse.statusText}`);
    }

    const rawProducts = await apiResponse.json();

    // Convert prices to INR
    const products = rawProducts.map((p: any) => ({
      ...p,
      price: p.price * USD_TO_INR
    }));

    // Filter by budget (which is now in INR)
    const filteredProducts = products.filter((product: any) => product.price <= budget);

    if (filteredProducts.length === 0) {
      const expl = "No products found matching your category and budget.";
      try {
        await connectToDatabase();
        await Message.create({ chatId, userId: DEMO_USER_ID, role: "assistant", content: expl });
      } catch (e) {
        console.error("Error saving assistant empty message to history:", e);
      }
      return NextResponse.json({
        action: "search",
        intent: { category, budget },
        message: expl,
        products: []
      });
    }

    // Phase 2: Decision Layer (Second Gemini Call)
    const decisionModel = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            selectedProductId: {
              type: SchemaType.NUMBER,
              description: "The ID of the best matching product from the provided list.",
            },
            explanation: {
              type: SchemaType.STRING,
              description: "A friendly, plain-language explanation of why this product was chosen, matching the language of the user's original message.",
            }
          },
          required: ["selectedProductId", "explanation"],
        } as any,
      },
    });

    const decisionPrompt = `You are a helpful commerce assistant. The user asked: "${message}".
Here are the available products that fit their budget:
${JSON.stringify(filteredProducts.map((p: any) => ({ id: p.id, title: p.title, price: p.price, description: p.description })), null, 2)}

Select the single best product that matches the user's request. 
Explain your reasoning in a friendly tone, in the exact same language (e.g., Malayalam, English, or mixed) that the user used.`;

    const decisionResult = await decisionModel.generateContent(decisionPrompt);
    const decisionResponseText = decisionResult.response.text();
    const decisionData = JSON.parse(decisionResponseText);

    let selectedProduct = filteredProducts.find((p: any) => p.id === decisionData.selectedProductId);
    
    // Fallback if the selected product ID is not in the filtered list
    if (!selectedProduct) {
      selectedProduct = filteredProducts[0];
    }

    const minimalProduct = {
      id: selectedProduct.id,
      title: selectedProduct.title,
      price: selectedProduct.price,
      image: selectedProduct.image,
    };

    // Phase 3 & 5: Save Memory and Last Suggested Product
    if (chatId) {
      try {
        await connectToDatabase();
        await UserPreference.findOneAndUpdate(
          { chatId },
          { 
            category, 
            budget,
            lastSuggestedProduct: minimalProduct
          },
          { upsert: true, new: true, returnDocument: 'after' } // fixed mongoose deprecation warning
        );
      } catch (e) {
        console.warn("Could not save preferences to DB");
      }
    }

    // Save assistant message to history
    try {
      await connectToDatabase();
      await Message.create({
        chatId,
        userId: DEMO_USER_ID,
        role: "assistant",
        content: decisionData.explanation,
        product: minimalProduct,
      });
    } catch (err) {
      console.error("Error saving assistant search message to history:", err);
    }

    return NextResponse.json({
      action: "search",
      intent: { category, budget },
      selectedProduct,
      explanation: decisionData.explanation
    });

  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
