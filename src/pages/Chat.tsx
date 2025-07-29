import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Menu, BookOpen, Calculator, Globe, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useSessions } from '../hooks/useSessions';
import { useStudyAgent } from '../hooks/useStudyAgent';
import { Message } from '../types/session';
import SessionSidebar from '../components/SessionSidebar';
import EmptyState from '../components/Empty';
import StudyProgress from '../components/StudyProgress';
import StudyModeSelector from '../components/StudyModeSelector';

const topicSuggestions = [
  { icon: Calculator, label: 'Math', color: 'bg-blue-100 text-blue-700' },
  { icon: BookOpen, label: 'Science', color: 'bg-green-100 text-green-700' },
  { icon: Globe, label: 'History', color: 'bg-purple-100 text-purple-700' },
  { icon: Languages, label: 'Languages', color: 'bg-orange-100 text-orange-700' },
];

export default function Chat() {
  const {
    sessions,
    currentSessionId,
    currentSession,
    createNewSession,
    createStudySession,
    switchToSession,
    deleteSession,
    updateSessionMessages,
    updateStudyPhase,
    updateProgress,
    hasAnySessions,
  } = useSessions();
  
  const studyAgent = useStudyAgent();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentSessionId || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    updateSessionMessages(currentSessionId, updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      if (studyAgent.isStudySession(currentSession)) {
        // Handle study session response
        const aiMessages = await studyAgent.processUserResponse(content.trim(), currentSession);
        const finalMessages = [...updatedMessages, ...aiMessages];
        updateSessionMessages(currentSessionId, finalMessages);
        
        // Update study phase and progress
        if (aiMessages.length > 0) {
          const newPhase = determineNewPhase(content.trim(), currentSession);
          if (newPhase) {
            updateStudyPhase(currentSessionId, newPhase);
          }
          
          // Update progress if moving to next step
          if (content.toLowerCase().includes('continue') || content.toLowerCase().includes('next')) {
            const currentStepIndex = currentSession.progress?.currentStepIndex ?? 0;
            updateProgress(currentSessionId, Math.min(currentStepIndex + 1, (currentSession.curriculum?.length ?? 1) - 1));
          }
        }
      } else {
        // Handle regular chat response
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: `I understand you're asking about "${content.trim()}". Let me help you with that! This is a simulated AI response. In a real implementation, this would connect to an actual AI service to provide detailed explanations and study assistance.

Would you like me to create a structured study session for this topic instead? I can break it down into manageable steps and guide you through it systematically.`,
            isUser: false,
            timestamp: new Date(),
          };
          const finalMessages = [...updatedMessages, aiResponse];
          updateSessionMessages(currentSessionId, finalMessages);
          setIsTyping(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const determineNewPhase = (response: string, session: any) => {
    if (!session.studyPhase) return null;
    
    const { phase } = session.studyPhase;
    const lowerResponse = response.toLowerCase();
    
    if (phase === 'planning' && (lowerResponse.includes('ready') || lowerResponse.includes('start'))) {
      return { ...session.studyPhase, phase: 'teaching' as const };
    } else if (phase === 'teaching' && lowerResponse.includes('continue')) {
      // Check if we should do understanding check
      const currentStepIndex = session.progress?.currentStepIndex ?? 0;
      if ((currentStepIndex + 1) % 3 === 0) {
        return { ...session.studyPhase, phase: 'questioning' as const };
      }
    } else if (phase === 'questioning') {
      return { ...session.studyPhase, phase: 'teaching' as const };
    }
    
    return null;
  };

  const handleTopicClick = (topic: string) => {
    handleSendMessage(`I want to learn about ${topic}`);
  };

  const handleNewSession = () => {
    createNewSession();
    setSidebarOpen(false);
  };
  
  const handleCreateFirstSession = () => {
    createNewSession();
  };

  const handleModeSelect = async (mode: 'chat' | 'study', topic?: string) => {
    if (mode === 'chat') {
      const sessionId = createNewSession(false);
      setSidebarOpen(false);
    } else if (mode === 'study' && topic) {
      const sessionId = createStudySession(topic);
      setSidebarOpen(false);
      
      // Initialize study session with curriculum
      try {
        const initialMessages = await studyAgent.initializeStudySession(topic, sessionId);
        updateSessionMessages(sessionId, initialMessages);
      } catch (error) {
        console.error('Error initializing study session:', error);
        toast.error('Failed to initialize study session');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show mode selector if no sessions exist
  if (!hasAnySessions) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">AI Study</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <StudyModeSelector onModeSelect={handleModeSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={switchToSession}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex min-w-0">
        {/* Chat Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentSession?.title || 'AI Study Chat'}
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Topic Suggestions */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3">Quick start topics:</p>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((topic) => {
                const IconComponent = topic.icon;
                return (
                  <button
                    key={topic.label}
                    onClick={() => handleTopicClick(topic.label)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${topic.color}`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{topic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : message.type === 'curriculum'
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 border border-blue-200'
                      : message.type === 'phase_transition'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-gray-900 border border-green-200'
                      : message.type === 'understanding_check'
                      ? 'bg-gradient-to-br from-purple-50 to-violet-50 text-gray-900 border border-purple-200'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, index) => (
                      <div key={index}>
                        {line.startsWith('## ') ? (
                          <h3 className="font-semibold text-base mb-2 text-gray-900">
                            {line.replace('## ', '')}
                          </h3>
                        ) : line.startsWith('**') && line.endsWith('**') ? (
                          <p className="font-medium mb-1">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        ) : line.trim() === '---' ? (
                          <hr className="my-3 border-gray-300" />
                        ) : line.trim() ? (
                          <p className="mb-2">{line}</p>
                        ) : (
                          <br />
                        )}
                      </div>
                    ))}
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-[120px]"
                  rows={1}
                />
              </div>
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
        </div>
        
        {/* Study Progress Sidebar */}
        {currentSession && studyAgent.isStudySession(currentSession) && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            <StudyProgress session={currentSession} />
          </div>
        )}
      </div>
    </div>
  );
}