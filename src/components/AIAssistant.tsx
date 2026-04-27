import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, User, MessageSquare, Loader2, Minimize2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Message {
    role: "user" | "assistant";
    content: string;
}

// Simple Arabic detection for RTL support
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

export const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Salam! I'm your Tomito AI Assistant. How can I help you find a movie or TV show today 🎬 ?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isOpen]);

    const renderContent = (content: string) => {
        const parts = content.split(/(\[.*?\]\(.*?\))/g);
        return parts.map((part, index) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                return (
                    <a
                        key={index}
                        href={match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-black text-primary hover:text-primary/80 transition-colors"
                    >
                        {match[1]}
                    </a>
                );
            }
            return part;
        });
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("https://tomito-chat-api.vercel.app/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error();
            const data = await response.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Smahli, wa9e3 mochkil f ddar. Jarreb mra khra! 🛠️" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            {/* Floating Chat Window with Glassmorphism */}
            {isOpen && (
                <div className="pointer-events-auto mb-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[85vh] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-black/90 backdrop-blur-3xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out">
                    {/* Header */}
                    <div className="relative p-6 pb-4 flex items-center justify-between overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-primary/10 opacity-50" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                                    <Bot className="w-7 h-7 text-white -rotate-3" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-black animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg tracking-tight text-white leading-none mb-1">Tomito AI</h3>
                                <span className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] opacity-80">Assistant Smart</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-white/10 relative z-10"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-6 h-6 text-white/60" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-3 py-6 space-y-4 no-scrollbar">
                        {messages.map((msg, i) => {
                            const rtl = isArabic(msg.content);
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex w-full",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        dir={rtl ? "rtl" : "ltr"}
                                        className={cn(
                                            "p-3.5 px-4 rounded-[1.5rem] text-[15px] font-semibold leading-relaxed shadow-sm max-w-[94%]",
                                            msg.role === "user"
                                                ? "bg-orange-500 text-white rounded-tr-none"
                                                : "bg-white/10 border border-white/5 text-white/95 rounded-tl-none",
                                        )}
                                    >
                                        {renderContent(msg.content)}
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="flex justify-start w-full">
                                <div className="bg-white/5 p-4 rounded-[1.5rem] rounded-tl-none border border-white/5 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 pt-2 bg-black/40">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-primary/30 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <div className="relative flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-[1.5rem] backdrop-blur-md">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Seuwel 3la ay film..."
                                    className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="h-11 w-11 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-90"
                                >
                                    <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button (FAB) */}
            {isOpen ? (
                <></>
            ) : (
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "pointer-events-auto h-16 w-16 rounded-[1.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 group relative overflow-hidden bg-orange-500 text-white"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-center relative">
                        <Bot className="w-9 h-9" />
                    </div>
                </Button>
            )}
        </div>
    );
};
