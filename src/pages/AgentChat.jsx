import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AgentChat() {
  const [searchParams] = useSearchParams();
  const agentName = searchParams.get('agent') || 'assistant';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const agentInfo = {
    assistant: {
      name: 'Alchemize Assistant',
      description: 'Your personal guide for manifestation and growth',
      icon: '\u2728',
      systemPrompt: 'You are Alchemize Assistant, a personal guide for manifestation, wellness, and personal growth. Be supportive, insightful, and empowering.',
    },
    bugfixer: {
      name: 'Tech Support',
      description: 'Fix bugs and data issues',
      icon: '\uD83D\uDD27',
      systemPrompt: 'You are a helpful tech support assistant for the Alchemize app. Help users troubleshoot issues concisely and clearly.',
    },
  };

  const currentAgent = agentInfo[agentName] || agentInfo.assistant;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput('');

    // Append user message immediately
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          system: currentAgent.systemPrompt,
          model: 'gpt-4o-mini',
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.content || data?.message || '' },
      ]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0118] text-white flex flex-col">
      <CosmicBackground />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-white/10">
        <Link to={createPageUrl('Home')}>
          <ArrowLeft className="w-5 h-5 text-purple-400" />
        </Link>
        <span className="text-2xl">{currentAgent.icon}</span>
        <div>
          <h1 className="font-semibold text-white">{currentAgent.name}</h1>
          <p className="text-purple-200/50 text-xs">{currentAgent.description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
            <p className="text-purple-200/40">Start a conversation</p>
            <p className="text-purple-200/20 text-sm">Ask me anything!</p>
          </div>
        )}
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'user' ? (
              <div className="max-w-[80%] bg-purple-600/30 border border-purple-500/20 rounded-2xl rounded-br-sm px-4 py-3">
                <p className="text-white text-sm">{message.content}</p>
              </div>
            ) : (
              <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-purple-100 text-sm mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 text-sm space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 text-sm space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-purple-100">{children}</li>,
                    code: ({ inline, children }) =>
                      inline ? (
                        <code className="bg-white/10 px-1 rounded text-xs">{children}</code>
                      ) : (
                        <code className="block bg-white/10 p-2 rounded text-xs mt-1 whitespace-pre-wrap">{children}</code>
                      ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </motion.div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-purple-200/50 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-8 pt-2 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            disabled={isStreaming}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform"
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
  );
}
