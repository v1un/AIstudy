export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'message' | 'curriculum' | 'phase_transition' | 'understanding_check';
}

export interface CurriculumStep {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  estimatedDuration?: string;
}

export interface StudyPhase {
  phase: 'planning' | 'teaching' | 'questioning' | 'completed';
  currentStepId?: string;
  awaitingResponse?: boolean;
  lastQuestionId?: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  // Study agent specific fields
  isStudySession?: boolean;
  topic?: string;
  curriculum?: CurriculumStep[];
  studyPhase?: StudyPhase;
  progress?: {
    completedSteps: number;
    totalSteps: number;
    currentStepIndex: number;
  };
}

export interface SessionsState {
  sessions: Session[];
  currentSessionId: string | null;
}