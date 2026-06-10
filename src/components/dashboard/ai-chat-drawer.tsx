"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Leaf } from 'lucide-react'
import { chatWithTwin } from '@/lib/actions/ai'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi, I am your digital EcoTwin. I track your activities and find spots to lower your daily footprint. Ask me anything about diet, transit, clean energy, or carbon metrics!",
      timestamp: new Date()
    }
  ])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setLoading(true)

    try {
      // Pass the conversation history to the Server Action
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const reply = await chatWithTwin(text, history)
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: reply || "I'm having trouble connecting right now, but I still support your green efforts! Keep logging to lower your footprint.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error("AI Chat failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const suggestionChips = [
    "How does a vegan diet help?",
    "What is a carbon score?",
    "Tips for my car commute"
  ]

  return (
    <>
      {/* Floating Pulse Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        >
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-75"></span>
          <MessageSquare className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-card/95 border-l border-border shadow-2xl z-50 flex flex-col justify-between backdrop-blur-md"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    <Leaf className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">EcoTwin Assistant</h4>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-[10px] text-primary font-semibold uppercase">Twin Synced</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat window */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-xl leading-relaxed border ${
                        m.role === 'user'
                          ? 'bg-primary border-primary/20 text-primary-foreground rounded-br-none'
                          : 'bg-muted/80 border-border/50 text-foreground rounded-bl-none'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex flex-col items-start">
                    <div className="max-w-[85%] p-3.5 rounded-xl bg-muted/80 border border-border/50 text-foreground rounded-bl-none flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions and Input */}
              <div className="p-4 border-t border-border bg-muted/20 space-y-4">
                {/* Suggestions chips */}
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestionChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 border border-border/40 rounded-full text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Form input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend(inputVal)
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask about your diet, EV charging, carbon rates..."
                    className="flex-1 px-4 py-2.5 text-xs bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary/50"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || loading}
                    className="p-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
