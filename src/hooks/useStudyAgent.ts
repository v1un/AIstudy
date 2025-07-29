import { useState, useCallback } from 'react';
import { Message, Session, CurriculumStep, StudyPhase } from '../types/session';
import { studyAgent } from '../lib/studyAgent';

export interface UseStudyAgentReturn {
  initializeStudySession: (topic: string, sessionId: string) => Promise<Message[]>;
  processUserResponse: (response: string, session: Session) => Promise<Message[]>;
  getCurrentStep: (session: Session) => CurriculumStep | null;
  getProgress: (session: Session) => { completed: number; total: number; percentage: number };
  isStudySession: (session: Session) => boolean;
  canProceedToNext: (session: Session) => boolean;
  markStepCompleted: (session: Session, stepId: string) => Session;
}

export const useStudyAgent = (): UseStudyAgentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeStudySession = useCallback(async (topic: string, sessionId: string): Promise<Message[]> => {
    setIsProcessing(true);
    
    try {
      // Generate curriculum for the topic
      const curriculum = studyAgent.generateCurriculum(topic);
      
      // Create initial messages
      const welcomeMessage: Message = {
        id: `${Date.now()}-welcome`,
        content: `Hello! I'm your AI study assistant. I'll help you learn about **${topic}** through a structured, interactive approach.`,
        isUser: false,
        timestamp: new Date(),
        type: 'message',
      };

      const curriculumMessage = studyAgent.generateCurriculumMessage(topic, curriculum);
      
      return [welcomeMessage, curriculumMessage];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processUserResponse = useCallback(async (response: string, session: Session): Promise<Message[]> => {
    if (!session.isStudySession || !session.curriculum || !session.studyPhase) {
      return [];
    }

    setIsProcessing(true);
    const newMessages: Message[] = [];

    try {
      const { studyPhase, curriculum, progress } = session;
      const currentStepIndex = progress?.currentStepIndex ?? 0;
      const currentStep = curriculum[currentStepIndex];

      switch (studyPhase.phase) {
        case 'planning':
          // User responded to curriculum - start teaching
          if (response.toLowerCase().includes('ready') || response.toLowerCase().includes('begin') || response.toLowerCase().includes('start')) {
            const transitionMessage = studyAgent.generatePhaseTransition('planning', 'teaching');
            newMessages.push(transitionMessage);
            
            if (currentStep) {
              const explanationMessage = studyAgent.generateStepExplanation(currentStep, session.topic || '');
              newMessages.push(explanationMessage);
            }
          } else if (response.toLowerCase().includes('modify') || response.toLowerCase().includes('change')) {
            const modificationMessage: Message = {
              id: Date.now().toString(),
              content: "I understand you'd like to modify the curriculum. What specific changes would you like to make? For example:\n\n- Add or remove specific topics\n- Adjust the pace or depth\n- Focus on particular aspects\n\nLet me know your preferences!",
              isUser: false,
              timestamp: new Date(),
              type: 'message',
            };
            newMessages.push(modificationMessage);
          } else {
            // Default response - assume ready to start
            const transitionMessage = studyAgent.generatePhaseTransition('planning', 'teaching');
            newMessages.push(transitionMessage);
            
            if (currentStep) {
              const explanationMessage = studyAgent.generateStepExplanation(currentStep, session.topic || '');
              newMessages.push(explanationMessage);
            }
          }
          break;

        case 'teaching':
          // User asking questions or ready to continue
          if (response.toLowerCase().includes('question') || response.includes('?')) {
            // Handle user question
            const questionResponse: Message = {
              id: Date.now().toString(),
              content: `Great question! ${generateQuestionResponse(response, currentStep, session.topic || '')}

Do you have any other questions about this topic, or shall we continue?`,
              isUser: false,
              timestamp: new Date(),
              type: 'message',
            };
            newMessages.push(questionResponse);
          } else if (response.toLowerCase().includes('continue') || response.toLowerCase().includes('next') || response.toLowerCase().includes('proceed')) {
            // Move to next step or understanding check
            if (shouldDoUnderstandingCheck(currentStepIndex)) {
              const understandingCheck = studyAgent.generateUnderstandingCheck(currentStep);
              newMessages.push(understandingCheck);
            } else {
              // Move to next step
              const nextStepIndex = currentStepIndex + 1;
              if (nextStepIndex < curriculum.length) {
                const nextStep = curriculum[nextStepIndex];
                const explanationMessage = studyAgent.generateStepExplanation(nextStep, session.topic || '');
                newMessages.push(explanationMessage);
              } else {
                // Completed all steps
                const completionMessage = studyAgent.generatePhaseTransition('teaching', 'completed');
                newMessages.push(completionMessage);
              }
            }
          } else {
            // Assume user wants to continue or is asking for clarification
            const clarificationMessage: Message = {
              id: Date.now().toString(),
              content: `I see you're engaging with the material! ${generateContextualResponse(response, currentStep)}

Do you have any specific questions, or would you like me to continue with the next topic?`,
              isUser: false,
              timestamp: new Date(),
              type: 'message',
            };
            newMessages.push(clarificationMessage);
          }
          break;

        case 'questioning':
          // User answered understanding check
          const encouragementMessage: Message = {
            id: Date.now().toString(),
            content: `${generateEncouragement(response)} 

${generateFeedback(response, currentStep)}`,
            isUser: false,
            timestamp: new Date(),
            type: 'message',
          };
          newMessages.push(encouragementMessage);

          // Continue to next step
          const nextStepIndex = currentStepIndex + 1;
          if (nextStepIndex < curriculum.length) {
            const transitionMessage = studyAgent.generatePhaseTransition('questioning', 'teaching', "Now let's move on to the next concept.");
            newMessages.push(transitionMessage);
            
            const nextStep = curriculum[nextStepIndex];
            const explanationMessage = studyAgent.generateStepExplanation(nextStep, session.topic || '');
            newMessages.push(explanationMessage);
          } else {
            // Completed all steps
            const completionMessage = studyAgent.generatePhaseTransition('questioning', 'completed');
            newMessages.push(completionMessage);
          }
          break;
      }

      return newMessages;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getCurrentStep = useCallback((session: Session): CurriculumStep | null => {
    if (!session.curriculum || !session.progress) return null;
    const currentIndex = session.progress.currentStepIndex;
    return session.curriculum[currentIndex] || null;
  }, []);

  const getProgress = useCallback((session: Session) => {
    if (!session.curriculum || !session.progress) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const { completedSteps, totalSteps } = session.progress;
    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      completed: completedSteps,
      total: totalSteps,
      percentage,
    };
  }, []);

  const isStudySession = useCallback((session: Session): boolean => {
    return Boolean(session.isStudySession && session.curriculum && session.studyPhase);
  }, []);

  const canProceedToNext = useCallback((session: Session): boolean => {
    if (!session.curriculum || !session.progress) return false;
    return session.progress.currentStepIndex < session.curriculum.length - 1;
  }, []);

  const markStepCompleted = useCallback((session: Session, stepId: string): Session => {
    if (!session.curriculum || !session.progress) return session;

    const updatedCurriculum = session.curriculum.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    );

    const completedSteps = updatedCurriculum.filter(step => step.completed).length;
    const currentStepIndex = Math.min(session.progress.currentStepIndex + 1, session.curriculum.length - 1);

    return {
      ...session,
      curriculum: updatedCurriculum,
      progress: {
        ...session.progress,
        completedSteps,
        currentStepIndex,
      },
    };
  }, []);

  // Helper methods
  const shouldDoUnderstandingCheck = (stepIndex: number): boolean => {
    return (stepIndex + 1) % 3 === 0; // Every 3rd step
  };

  const generateQuestionResponse = (question: string, step: CurriculumStep | undefined, topic: string): string => {
    // In a real implementation, this would use an LLM to generate contextual responses
    const responses = [
      `That's an excellent question about ${step?.title.toLowerCase() || topic}!`,
      `I'm glad you asked about that!`,
      `Great thinking! Let me explain that further.`,
      `That's a really important point to understand.`,
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return `${randomResponse} Let me provide a detailed answer to help clarify this concept.`;
  };

  const generateContextualResponse = (response: string, step: CurriculumStep | undefined): string => {
    if (response.length < 10) {
      return "I appreciate your engagement!";
    }
    
    if (response.toLowerCase().includes('understand') || response.toLowerCase().includes('clear')) {
      return "I'm glad this is making sense to you!";
    }
    
    if (response.toLowerCase().includes('confus') || response.toLowerCase().includes('difficult')) {
      return "I understand this can be challenging. Let me explain it differently.";
    }
    
    return "Thank you for sharing your thoughts!";
  };

  const generateEncouragement = (response: string): string => {
    const encouragements = [
      "Excellent thinking!",
      "Great job!",
      "You're doing really well!",
      "That shows good understanding!",
      "Nice work!",
    ];
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const generateFeedback = (response: string, step: CurriculumStep | undefined): string => {
    // Simple feedback based on response length and content
    if (response.length > 50) {
      return "I can see you've really thought about this concept. Your detailed response shows you're actively engaging with the material.";
    } else if (response.toLowerCase().includes('yes') || response.toLowerCase().includes('understand')) {
      return "Perfect! It sounds like you've grasped the key concepts.";
    } else {
      return "I appreciate you taking the time to think through this concept.";
    }
  };

  return {
    initializeStudySession,
    processUserResponse,
    getCurrentStep,
    getProgress,
    isStudySession,
    canProceedToNext,
    markStepCompleted,
  };
};