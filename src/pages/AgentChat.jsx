import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AgentChat() {
  const [searchParams] = useSearchParams();
  const agentName = searchParams.get('agent') || 'assistant';
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const agentInfo = {
    assistant: {
      name: 'Alchemize Assistant',
      description: 'Your personal guide for manifestation and growth',
      icon: '✨'
    },
    bugfixer: {
      name: 'Tech Support',
      description: 'Fix bugs and data issues',
      icon: '🔧'
    }
  };

  const currentAgent = agentInfo[agentName] || agentInfo.assistant;

  // Create conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: agentName,
          metadata: {
            name: `${currentAgent.name} Chat`,
            description: currentAgent.description
          }
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    };
    initConversation();
  }, [agentName]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsStreaming(data.messages?.some(m => m.role === 'assistant' && !m.content));
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Scroll to bottom when messages change
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
    <CosmicBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent backdrop-blur-sm px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentAgent.icon}</span>
              <div>
                <h1 className="text-lg font-bold text-white">{currentAgent.name}</h1>
                <p className="text-xs text-white/50">{currentAgent.description}</p>
              </div>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/60 text-sm mb-2">Start a conversation</p>
              <p className="text-white/40 text-xs">Ask me anything!</p>
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
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
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
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="ml-4 mb-2 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="ml-4 mb-2 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
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

                {/* Tool calls */}
                {message.tool_calls?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.tool_calls.map((tool, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-black/20 rounded-lg px-2 py-1.5 border border-white/10"
                      >
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-300">{tool.name?.split('.').pop()}</span>
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
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-white/60 text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0118] to-transparent backdrop-blur-sm px-6 py-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={isStreaming || !conversationId}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming || !conversationId}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
}