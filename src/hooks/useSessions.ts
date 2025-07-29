import { useState, useEffect } from 'react';
import { Session, Message, SessionsState, CurriculumStep, StudyPhase } from '../types/session';
import { studyAgent } from '../lib/studyAgent';

const STORAGE_KEY = 'ai-study-sessions';

const getInitialMessage = (): Message => ({
  id: '1',
  content: 'Hello! I\'m your AI study assistant. I\'m here to help you learn and understand any topic. What would you like to study today?',
  isUser: false,
  timestamp: new Date(),
});

const generateSessionTitle = (messages: Message[]): string => {
  const userMessages = messages.filter(msg => msg.isUser);
  if (userMessages.length === 0) return 'New Study Session';
  
  const firstUserMessage = userMessages[0].content;
  return firstUserMessage.length > 30 
    ? firstUserMessage.substring(0, 30) + '...'
    : firstUserMessage;
};

export const useSessions = () => {
  const [sessionsState, setSessionsState] = useState<SessionsState>({
    sessions: [],
    currentSessionId: null,
  });

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const sessions = parsed.sessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setSessionsState({ ...parsed, sessions });
      } catch (error) {
        console.error('Failed to parse sessions from localStorage:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsState));
  }, [sessionsState]);

  const createNewSession = (isStudySession?: boolean): string => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: isStudySession ? 'New Study Session' : 'New Chat Session',
      messages: [getInitialMessage()],
      createdAt: new Date(),
      updatedAt: new Date(),
      isStudySession,
    };

    setSessionsState(prev => ({
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newSession.id,
    }));

    return newSession.id;
  };

  const createStudySession = (topic: string): string => {
    const curriculum = studyAgent.generateCurriculum(topic);
    const studyPhase: StudyPhase = {
      phase: 'planning',
      currentStepId: curriculum[0]?.id,
      awaitingResponse: false,
    };

    const newSession: Session = {
      id: Date.now().toString(),
      title: `Study: ${topic}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isStudySession: true,
      topic,
      curriculum,
      studyPhase,
      progress: {
        completedSteps: 0,
        totalSteps: curriculum.length,
        currentStepIndex: 0,
      },
    };

    setSessionsState(prev => ({
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newSession.id,
    }));

    return newSession.id;
  };

  const updateStudyPhase = (sessionId: string, phase: StudyPhase) => {
    setSessionsState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, studyPhase: phase, updatedAt: new Date() }
          : session
      ),
    }));
  };

  const updateProgress = (sessionId: string, stepIndex: number) => {
    setSessionsState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session => {
        if (session.id === sessionId && session.curriculum) {
          const completedSteps = session.curriculum.filter(step => step.completed).length;
          return {
            ...session,
            progress: {
              completedSteps,
              totalSteps: session.curriculum.length,
              currentStepIndex: stepIndex,
            },
            updatedAt: new Date(),
          };
        }
        return session;
      }),
    }));
  };

  const switchToSession = (sessionId: string) => {
    setSessionsState(prev => ({
      ...prev,
      currentSessionId: sessionId,
    }));
  };

  const deleteSession = (sessionId: string) => {
    setSessionsState(prev => {
      const newSessions = prev.sessions.filter(s => s.id !== sessionId);
      const newCurrentId = prev.currentSessionId === sessionId 
        ? (newSessions.length > 0 ? newSessions[0].id : null)
        : prev.currentSessionId;
      
      return {
        sessions: newSessions,
        currentSessionId: newCurrentId,
      };
    });
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessionsState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages,
              title: generateSessionTitle(messages),
              updatedAt: new Date(),
            }
          : session
      ),
    }));
  };

  const getCurrentSession = (): Session | null => {
    if (!sessionsState.currentSessionId) return null;
    return sessionsState.sessions.find(s => s.id === sessionsState.currentSessionId) || null;
  };

  const clearAllSessions = () => {
    setSessionsState({
      sessions: [],
      currentSessionId: null,
    });
  };

  return {
    sessions: sessionsState.sessions,
    currentSessionId: sessionsState.currentSessionId,
    currentSession: getCurrentSession(),
    createNewSession,
    createStudySession,
    switchToSession,
    deleteSession,
    updateSessionMessages,
    updateStudyPhase,
    updateProgress,
    clearAllSessions,
    hasAnySessions: sessionsState.sessions.length > 0,
  };
};