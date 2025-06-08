'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  model?: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  contextTokens: string;
  features: string[];
  icon: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    description: '플래그십 모델 - 대규모 컨텍스트와 복잡한 추론',
    contextTokens: '1M 토큰',
    features: ['멀티모달', '코딩 최적화', '복합 지시문'],
    icon: '🚀'
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    description: '경량화 모델 - 빠른 속도와 비용 효율성',
    contextTokens: '65K 토큰',
    features: ['고속 처리', '비용 효율', '대량 요청'],
    icon: '⚡'
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    description: '소형 추론 모델 - 멀티모달과 툴 호출',
    contextTokens: '200K/100K 토큰',
    features: ['툴 호출', '멀티모달', '실시간 분석'],
    icon: '🧠'
  },
  {
    id: 'o3',
    name: 'o3',
    description: '최강 추론 모델 - Private chain of thought',
    contextTokens: '200K/100K 토큰',
    features: ['깊이 있는 추론', '과학/수학', '복합 의사결정'],
    icon: '🎯'
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4.1-mini');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          systemPrompt: systemPrompt.trim() || undefined,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, response.statusText, errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.details || errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('Response Error:', data);
        throw new Error(data.error);
      }

      // 타이핑 효과 시뮬레이션
      const fullMessage = data.message;
      const assistantMessageId = (Date.now() + 1).toString();
      
      // 스트리밍 메시지 생성
      const streamingAssistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        model: selectedModel,
      };
      
      setMessages(prev => [...prev, streamingAssistantMessage]);
      setIsLoading(false);

      // 타이핑 애니메이션
      for (let i = 0; i <= fullMessage.length; i++) {
        const partialMessage = fullMessage.slice(0, i);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: partialMessage }
              : msg
          )
        );
        await new Promise(resolve => setTimeout(resolve, 20)); // 타이핑 속도 조절
      }

      // 스트리밍 완료
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };



  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showModelSelector && !target.closest('.model-selector')) {
        setShowModelSelector(false);
      }
    };

    if (showModelSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelSelector]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    // 시스템 다크모드 감지
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-md border-b transition-all duration-300 px-6 py-4 flex items-center justify-between ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`relative p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/25'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25'
          }`}>
            <Sparkles className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className={`text-xl font-bold transition-colors duration-300 bg-clip-text text-transparent ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              게임취업밤 게임잼 Chatbot
            </h1>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Powered by OpenAI
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Model Selector */}
          <div className="relative model-selector">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModelSelector(!showModelSelector);
                setShowSettings(false);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 bg-gray-50'
              }`}
            >
              <span>{AI_MODELS.find(m => m.id === selectedModel)?.icon}</span>
              <span>{AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
              <span className="text-xs">▼</span>
            </button>
            
            {showModelSelector && (
              <div 
                className={`absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-2 duration-200 ${
                  isDarkMode
                    ? 'bg-gray-800/95 border-gray-700'
                    : 'bg-white/95 border-gray-200'
                }`} 
                style={{ zIndex: 9999 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    AI 모델 선택
                  </h3>
                  <div className="space-y-2">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(model.id);
                          setShowModelSelector(false);
                          console.log('Model selected:', model.id);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                          selectedModel === model.id
                            ? isDarkMode
                              ? 'bg-blue-600/20 border border-blue-500/30'
                              : 'bg-blue-50 border border-blue-200'
                            : isDarkMode
                              ? 'hover:bg-gray-700 border border-transparent'
                              : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{model.icon}</span>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {model.name}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {model.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {model.contextTokens}
                              </span>
                              {model.features.slice(0, 2).map((feature, idx) => (
                                <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                                  isDarkMode
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
              isDarkMode
                ? 'text-yellow-400 hover:bg-gray-700 bg-gray-700/50'
                : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
            }`}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowModelSelector(false);
            }}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-700/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-700/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 bg-gray-50'
            }`}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`backdrop-blur-md border-b transition-all duration-300 p-6 animate-in slide-in-from-top-2 relative ${
          isDarkMode
            ? 'bg-purple-900/20 border-purple-800'
            : 'bg-purple-50/80 border-purple-200'
        }`} style={{ zIndex: 10 }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${
                isDarkMode
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  AI Configuration
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Customize how your AI assistant behaves
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className={`w-full p-4 rounded-2xl resize-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-400'
                      : 'bg-white/50 border border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={4}
                  placeholder="Enter system prompt to customize the AI's behavior..."
                />
                <p className={`text-xs mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  💡 This prompt will be sent with every message to customize how the AI responds. Try being specific about tone, style, or expertise level.
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemPrompt.trim() ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {systemPrompt.trim() ? 'Custom prompt active' : 'Using default prompt'}
                  </span>
                </div>
                <button
                  onClick={() => setSystemPrompt('You are a helpful AI assistant.')}
                  className={`px-3 py-1 text-xs rounded-lg transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Reset to default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className={`relative mb-6 inline-block p-4 rounded-3xl ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20'
                  : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
              }`}>
                <Sparkles className={`w-16 h-16 mx-auto ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                 우측 상단의 모델 선택 버튼을 통해 원하는 모델을 호출해 대화하세요
              </h3>
              <p className={`text-lg mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Start a conversation by typing a message below.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex animate-in slide-in-from-bottom-2 duration-500 mb-6 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`group flex max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 ml-3 shadow-lg shadow-blue-500/25'
                        : `${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mr-3 shadow-lg`
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    )}
                  </div>
                  <div
                    className={`relative px-6 py-4 rounded-2xl max-w-full transition-all duration-300 group-hover:shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                        : `${
                            isDarkMode
                              ? 'bg-gray-800/80 text-gray-100 border border-gray-700'
                              : 'bg-white/80 text-gray-900 border border-gray-200 shadow-lg'
                          } backdrop-blur-sm`
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words leading-loose text-base">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-current animate-pulse ml-1" />
                      )}
                    </div>
                    
                    <div
                      className={`text-xs mt-3 opacity-75 flex items-center justify-between ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.role === 'assistant' && message.model && (
                        <div className="flex items-center space-x-1">
                          <span>{AI_MODELS.find(m => m.id === message.model)?.icon}</span>
                          <span className="text-xs">{AI_MODELS.find(m => m.id === message.model)?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-500 mb-6">
              <div className="group flex">
                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl mr-3 flex items-center justify-center shadow-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Bot className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className={`px-6 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:shadow-lg ${
                  isDarkMode
                    ? 'bg-gray-800/80 text-gray-100 border border-gray-700'
                    : 'bg-white/80 text-gray-900 border border-gray-200 shadow-lg'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                      }`} style={{ animationDelay: '0ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                      }`} style={{ animationDelay: '150ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                      }`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className={`backdrop-blur-md border-t transition-all duration-300 p-6 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className={`flex items-end space-x-4 p-4 rounded-3xl transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800/50 border border-gray-700 shadow-xl'
                : 'bg-white/50 border border-gray-200 shadow-xl'
            }`}>
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything... 💭"
                  className={`w-full p-4 pr-14 rounded-2xl resize-none focus:outline-none transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700/50 text-gray-100 placeholder-gray-400 border border-gray-600 focus:border-blue-500'
                      : 'bg-gray-50/50 text-gray-900 placeholder-gray-500 border border-gray-300 focus:border-blue-500'
                  }`}
                  rows={1}
                  disabled={isLoading}
                  style={{ 
                    minHeight: '56px',
                    maxHeight: '120px'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                    !inputValue.trim() || isLoading
                      ? isDarkMode
                        ? 'text-gray-500 bg-gray-700'
                        : 'text-gray-400 bg-gray-200'
                      : 'text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-xl'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-medium">Press Enter</span> to send • <span className="font-medium">Shift+Enter</span> for new line
            </p>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
                isDarkMode
                  ? 'bg-gray-700/50 text-gray-400'
                  : 'bg-gray-100/50 text-gray-600'
              }`}>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
