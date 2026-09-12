"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Plus, Sidebar as SidebarIcon, ChevronDown, ArrowUp, Square, Copy, RefreshCcw, Sparkles, MessageSquare, ShoppingBag } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  paymentLink?: string;
  product?: {
    id: number;
    title: string;
    price: number;
    description?: string;
    image: string;
  };
};

type ChatMeta = {
  chatId: string;
  title: string;
  updatedAt: string;
};

type Order = {
  _id: string;
  orderId: string;
  product: { id: number; title: string; price: number; image: string };
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: { name: string; city: string; state: string; pincode: string };
  amount: number;
  createdAt: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState("");
  const [chats, setChats] = useState<ChatMeta[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [activeView, setActiveView] = useState<"chat" | "order">("chat");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch sidebar chat list
  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  // Load a specific chat's messages
  const loadChat = async (targetChatId: string) => {
    setIsLoading(true);
    setMessages([]);
    setActiveView("chat");
    try {
      const res = await fetch(`/api/chats/${targetChatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map((m: any) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          product: m.product?.id ? m.product : undefined,
          paymentLink: m.paymentLink
        })));
      }
      setChatId(targetChatId);
      sessionStorage.setItem("shopmate_chatId", targetChatId);
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize session / Load refresh state
  useEffect(() => {
    fetchChats();
    fetchOrders();

    const urlParams = new URLSearchParams(window.location.search);
    const paymentCallback = urlParams.get("payment_callback");
    const paymentLinkId = urlParams.get("razorpay_payment_link_id");
    
    let activeChatId = sessionStorage.getItem("shopmate_chatId");

    if (!activeChatId) {
      activeChatId = "session_" + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem("shopmate_chatId", activeChatId);
    }

    setChatId(activeChatId);

    if (paymentCallback && paymentLinkId) {
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verify Order
      setIsLoading(true);
      fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_link_id: paymentLinkId, chatId: activeChatId }),
      })
        .then(res => res.json())
        .then(() => {
          loadChat(activeChatId as string);
          fetchOrders();
        })
        .catch(err => {
          console.error("Error verifying payment", err);
          loadChat(activeChatId as string);
        });
    } else {
      loadChat(activeChatId);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (activeView === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, activeView]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (activeView !== "chat") {
      setActiveView("chat");
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, chatId }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.explanation || data.message || "I found something for you.",
        product: data.selectedProduct,
        paymentLink: data.paymentLink,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (messages.length === 0) {
        fetchChats();
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I ran into an issue finding that for you.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setActiveView("chat");
    setMessages([]);
    const newId = "session_" + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem("shopmate_chatId", newId);
    setChatId(newId);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setActiveView("order");
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full flex-col w-[280px] bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] shrink-0 transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0 hidden md:flex"}
      `}>
        <div className="flex items-center justify-between p-4 h-14 shrink-0 border-b border-[var(--border-subtle)]/50">
          <span className="font-semibold text-sm tracking-wide">Shopmate</span>
          <button 
            onClick={() => { handleNewChat(); setIsSidebarOpen(false); }}
            className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-md transition-colors"
            title="New Chat"
          >
            <Plus className="w-4 h-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 px-2 pt-2">Saved Conversations</div>
            {chats.map((c) => (
              <button
                key={c.chatId}
                onClick={() => { loadChat(c.chatId); setIsSidebarOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                  activeView === "chat" && chatId === c.chatId 
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50 hover:text-[var(--text-primary)]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>

          {orders.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 px-2 pt-2">Orders</div>
              {orders.map((o) => (
                <button
                  key={o._id}
                  onClick={() => handleViewOrder(o)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                    activeView === "order" && selectedOrder?._id === o._id
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">{o.orderId}</span>
                    <span className="truncate text-xs opacity-70">{o.product.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="flex items-center px-4 h-14 border-b border-[var(--border-subtle)]/50 shrink-0">
          <button 
            className="md:hidden p-1.5 mr-2 hover:bg-[var(--bg-elevated)] rounded-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            <SidebarIcon className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer text-sm font-medium transition-colors">
            {activeView === "order" ? "Order Details" : "Shopmate AI"} <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
        </header>

        {activeView === "order" && selectedOrder ? (
          <div className="flex-1 overflow-y-auto px-4 py-8 flex justify-center items-start">
            <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[14px] overflow-hidden w-full max-w-[500px]">
              <div className="p-4 border-b border-[var(--border-subtle)]">
                <h2 className="text-xl font-semibold">Order Confirmed</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{selectedOrder.orderId}</p>
              </div>
              <div className="flex border-b border-[var(--border-subtle)]">
                <div className="w-32 bg-white shrink-0 p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedOrder.product.image} alt={selectedOrder.product.title} className="max-h-24 object-contain mix-blend-multiply" />
                </div>
                <div className="p-4 flex flex-col justify-center">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{selectedOrder.product.title}</h3>
                  <p className="text-lg font-semibold">₹{Number(selectedOrder.product.price).toFixed(2)}</p>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-[var(--text-muted)] mb-1">Payment Status</span>
                    <span className="font-medium capitalize text-green-500">{selectedOrder.paymentStatus}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--text-muted)] mb-1">Order Status</span>
                    <span className="font-medium capitalize text-[var(--text-primary)]">{selectedOrder.orderStatus}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[var(--text-muted)] mb-1 text-sm">Delivering to</span>
                  <div className="text-sm text-[var(--text-primary)] leading-relaxed">
                    <p className="font-medium">{selectedOrder.deliveryAddress.name}</p>
                    <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                    <p>{selectedOrder.deliveryAddress.pincode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-8">
            <div className="max-w-[900px] mx-auto space-y-12">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center opacity-0 animate-in fade-in duration-500">
                  <Sparkles className="w-8 h-8 text-[var(--text-secondary)] mb-4" />
                  <h1 className="text-xl font-medium mb-2">How can I help you shop?</h1>
                  <p className="text-[var(--text-secondary)] text-sm">Ask me to find products matching your budget.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "user" ? (
                      <div className="bg-[var(--user-msg-surface)] text-[var(--user-msg-text)] px-4 py-2.5 rounded-2xl max-w-[80%] text-[15px] leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="flex flex-col w-full max-w-[900px]">
                        <div className="flex gap-4">
                          <div className="w-6 h-6 shrink-0 rounded-full border border-[var(--border-subtle)] flex items-center justify-center mt-1">
                            <Sparkles className="w-3 h-3 text-[var(--text-primary)]" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
                              {msg.content}
                            </div>

                            {msg.product && msg.product.id && !msg.content.includes("Order Confirmed") && (
                              <div className="flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[14px] overflow-hidden max-w-[400px] hover:border-[#444] transition-colors">
                                <div className="flex">
                                  <div className="w-32 bg-white shrink-0 p-2 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={msg.product.image} alt={msg.product.title} className="max-h-24 object-contain mix-blend-multiply" />
                                  </div>
                                  <div className="p-4 flex flex-col justify-center">
                                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{msg.product.title}</h3>
                                    <p className="text-lg font-semibold">₹{Number(msg.product.price).toFixed(2)}</p>
                                  </div>
                                </div>
                                {msg.paymentLink && (
                                  <div className="p-3 border-t border-[var(--border-subtle)] bg-[#1A1A1A]">
                                    <a 
                                      href={msg.paymentLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block w-full py-2.5 text-center bg-[#F5F5F5] hover:bg-white text-[#111111] text-sm font-semibold rounded-lg transition-colors shadow-sm"
                                    >
                                      Pay Now securely via Razorpay
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {msg.content.includes("Order Confirmed") && msg.product && (
                              <div className="flex flex-col bg-[var(--bg-elevated)] border border-green-900/50 rounded-[14px] overflow-hidden max-w-[400px]">
                                <div className="p-3 bg-green-900/20 border-b border-green-900/30 text-green-400 text-sm font-medium flex items-center gap-2">
                                  <ShoppingBag className="w-4 h-4" /> Order Processed Successfully
                                </div>
                                <div className="flex">
                                  <div className="w-32 bg-white shrink-0 p-2 flex items-center justify-center border-r border-[var(--border-subtle)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={msg.product.image} alt={msg.product.title} className="max-h-24 object-contain mix-blend-multiply" />
                                  </div>
                                  <div className="p-4 flex flex-col justify-center">
                                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{msg.product.title}</h3>
                                    <p className="text-lg font-semibold text-[var(--text-primary)]">₹{Number(msg.product.price).toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                              <button className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]" title="Copy">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]" title="Regenerate">
                                <RefreshCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="flex gap-4 max-w-[900px]">
                    <div className="w-6 h-6 shrink-0 rounded-full border border-[var(--border-subtle)] flex items-center justify-center mt-1">
                      <Sparkles className="w-3 h-3 text-[var(--text-primary)]" />
                    </div>
                    <div className="flex items-center h-8">
                      <span className="text-[15px] font-medium animate-shimmer">
                        Reading context...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="p-4 shrink-0 w-full max-w-[900px] mx-auto">
          <div className="bg-[var(--bg-composer)] border border-[var(--border-subtle)] rounded-[16px] p-2 focus-within:border-[#444] transition-colors relative shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none max-h-48 min-h-[44px] py-3 px-3 text-[15px]"
              rows={1}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                onClick={isLoading ? () => {} : handleSend}
                disabled={!input.trim() && !isLoading}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                  input.trim() || isLoading 
                    ? "bg-[var(--text-primary)] text-[var(--bg-app)] hover:opacity-90" 
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
                }`}
              >
                {isLoading ? <Square className="w-3.5 h-3.5 fill-current" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-center mt-2 text-xs text-[var(--text-muted)]">
            Shopmate can make mistakes. Check important info.
          </div>
        </div>
      </main>
    </div>
  );
}
