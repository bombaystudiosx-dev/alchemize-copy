import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function FloatingChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  // Create conversation when opened
  useEffect(() => {
    if (isOpen && !conversationId) {
      const initConversation = async () => {
        try {
          const conv = await base44.agents.createConversation({
            agent_name: 'assistant',
            metadata: {
              name: 'Alchemize Assistant',
              description: 'Your personal guide'
            }
          });
          setConversationId(conv.id);
        } catch (error) {
          console.error('Failed to create conversation:', error);
        }
      };
      initConversation();
    }
  }, [isOpen, conversationId]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsStreaming(data.messages?.some(m => m.role === 'assistant' && !m.content));
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    setIsStreaming(true);

    try {
      const conversation = { id: conversationId };
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/50 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-6 right-6 w-[calc(100%-3rem)] sm:w-96 h-[600px] max-h-[calc(100vh-3rem)] bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-white/50">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white/60 text-sm mb-1">Hi! I'm your AI assistant</p>
                    <p className="text-white/40 text-xs">Ask me anything about your journey</p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                          : 'bg-white/10 backdrop-blur-sm text-white border border-white/10'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      ) : (
                        <ReactMarkdown
                          className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed text-sm">{children}</p>,
                            ul: ({ children }) => <ul className="ml-4 mb-1 list-disc text-sm">{children}</ul>,
                            ol: ({ children }) => <ol className="ml-4 mb-1 list-decimal text-sm">{children}</ol>,
                            li: ({ children }) => <li className="mb-0.5 text-sm">{children}</li>,
                            code: ({ inline, children }) =>
                              inline ? (
                                <code className="px-1 py-0.5 rounded bg-white/10 text-purple-300 text-xs">
                                  {children}
                                </code>
                              ) : (
                                <code className="block p-2 rounded bg-black/30 text-xs overflow-x-auto">
                                  {children}
                                </code>
                              ),
                          }}
                        >
                          {message.content || '...'}
                        </ReactMarkdown>
                      )}

                      {message.tool_calls?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {message.tool_calls.map((tool, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-black/20 rounded px-2 py-1 border border-white/10"
                            >
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span className="text-purple-300 text-xs">{tool.name?.split('.').pop()}</span>
                                {tool.status === 'running' && (
                                  <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isStreaming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                        <span className="text-white/60 text-xs">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/10 bg-black/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    disabled={isStreaming || !conversationId}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming || !conversationId}
                    className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    {isStreaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}