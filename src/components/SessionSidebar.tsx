import { useState } from 'react';
import { MessageSquare, Plus, Trash2, MoreVertical, X, BookOpen, CheckCircle } from 'lucide-react';
import { Session } from '../types/session';
import { toast } from 'sonner';

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionSidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  isOpen,
  onClose,
}: SessionSidebarProps) {
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      toast.error('Cannot delete the last session');
      return;
    }
    
    setDeletingSessionId(sessionId);
    setTimeout(() => {
      onDeleteSession(sessionId);
      setDeletingSessionId(null);
      toast.success('Session deleted');
    }, 150);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto lg:w-64
      `}>
        <div className="flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Study Sessions</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* New Session Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => {
                onNewSession();
                toast.success('New session created!');
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Session</span>
            </button>
          </div>
          
          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No sessions yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {sessions.map((session) => {
                  const isActive = session.id === currentSessionId;
                  const isDeleting = deletingSessionId === session.id;
                  
                  return (
                    <div
                      key={session.id}
                      onClick={() => onSessionSelect(session.id)}
                      className={`
                        group relative p-3 rounded-lg cursor-pointer transition-all duration-150
                        ${isActive 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                        }
                        ${isDeleting ? 'opacity-50 scale-95' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {session.isStudySession ? (
                              <BookOpen className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                            ) : (
                              <MessageSquare className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                            )}
                            {session.isStudySession && session.progress && session.progress.completedSteps === session.progress.totalSteps && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <h3 className={`
                            text-sm font-medium truncate
                            ${isActive ? 'text-blue-900' : 'text-gray-900'}
                          `}>
                            {session.title}
                          </h3>
                          <p className={`
                            text-xs mt-1
                            ${isActive ? 'text-blue-600' : 'text-gray-500'}
                          `}>
                            {formatDate(session.updatedAt)} • {session.messages.length} messages
                          </p>
                          {session.isStudySession && session.progress && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                                  Progress: {session.progress.completedSteps}/{session.progress.totalSteps}
                                </span>
                                <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                                  {Math.round((session.progress.completedSteps / session.progress.totalSteps) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    isActive ? 'bg-blue-500' : 'bg-gray-400'
                                  }`}
                                  style={{
                                    width: `${(session.progress.completedSteps / session.progress.totalSteps) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {sessions.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                            title="Delete session"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                      </div>
                      
                      {/* Preview of last message */}
                      {session.messages.length > 1 && (
                        <div className="mt-2">
                          <p className={`
                            text-xs line-clamp-2
                            ${isActive ? 'text-blue-700' : 'text-gray-600'}
                          `}>
                            {session.messages[session.messages.length - 1].content}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}