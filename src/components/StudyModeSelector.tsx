import { useState } from 'react';
import { BookOpen, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

interface StudyModeSelectorProps {
  onModeSelect: (mode: 'chat' | 'study', topic?: string) => void;
  className?: string;
}

export default function StudyModeSelector({ onModeSelect, className = '' }: StudyModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'chat' | 'study' | null>(null);
  const [studyTopic, setStudyTopic] = useState('');

  const popularTopics = [
    'Nitrogen Cycle',
    'Photosynthesis',
    'Cellular Respiration',
    'DNA Replication',
    'Mitosis and Meiosis',
    'Evolution',
    'Ecosystem Dynamics',
    'Chemical Bonding',
  ];

  const handleModeSelect = (mode: 'chat' | 'study') => {
    if (mode === 'chat') {
      onModeSelect('chat');
    } else {
      setSelectedMode('study');
    }
  };

  const handleStudyStart = () => {
    if (studyTopic.trim()) {
      onModeSelect('study', studyTopic.trim());
    }
  };

  const handleTopicSelect = (topic: string) => {
    setStudyTopic(topic);
    onModeSelect('study', topic);
  };

  if (selectedMode === 'study') {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Study Session</h2>
            <p className="text-gray-600">
              I'll create a personalized curriculum and guide you through the topic step by step.
            </p>
          </div>

          {/* Topic Input */}
          <div className="mb-6">
            <label htmlFor="study-topic" className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to learn about?
            </label>
            <div className="flex space-x-2">
              <input
                id="study-topic"
                type="text"
                value={studyTopic}
                onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="e.g., Nitrogen cycle, Photosynthesis, DNA replication..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleStudyStart()}
              />
              <button
                onClick={handleStudyStart}
                disabled={!studyTopic.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                <span>Start</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Popular Topics */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Topics</h3>
            <div className="grid grid-cols-2 gap-2">
              {popularTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicSelect(topic)}
                  className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setSelectedMode(null)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to mode selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Study</h1>
        <p className="text-gray-600 text-lg">
          Choose how you'd like to interact with your AI assistant
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chat Mode */}
        <div
          onClick={() => handleModeSelect('chat')}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chat Mode</h2>
            <p className="text-gray-600 mb-4">
              Have a free-flowing conversation with your AI tutor. Ask questions, get explanations, and explore topics naturally.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Flexible conversation</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Instant answers</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Topic exploration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Study Mode */}
        <div
          onClick={() => handleModeSelect('study')}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              Recommended
            </span>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Study Mode</h2>
            <p className="text-gray-600 mb-4">
              Get a structured learning experience with personalized curriculum, step-by-step explanations, and progress tracking.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Personalized curriculum</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Understanding checks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}