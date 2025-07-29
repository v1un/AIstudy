import { MessageSquare, Sparkles, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  onCreateSession: () => void;
}

export default function EmptyState({ onCreateSession }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="relative">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-blue-500 absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Study Sessions Yet
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Start your first AI-powered study session! Ask questions, get explanations, 
          and learn about any topic with your personal AI tutor.
        </p>
        
        <button
          onClick={onCreateSession}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <BookOpen className="h-5 w-5" />
          <span>Start Your First Session</span>
        </button>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>💡 Tip: Try asking about Math, Science, History, or Languages!</p>
        </div>
      </div>
    </div>
  );
}