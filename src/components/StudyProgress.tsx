import { CheckCircle, Circle, Clock, BookOpen } from 'lucide-react';
import { CurriculumStep, Session } from '../types/session';

interface StudyProgressProps {
  session: Session;
  className?: string;
}

export default function StudyProgress({ session, className = '' }: StudyProgressProps) {
  if (!session.isStudySession || !session.curriculum || !session.progress) {
    return null;
  }

  const { curriculum, progress } = session;
  const { completedSteps, totalSteps, currentStepIndex } = progress;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Study Progress</h3>
        </div>
        <div className="text-sm text-gray-500">
          {completedSteps} of {totalSteps} completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Overall Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Current Topic */}
      {session.topic && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900">Currently Studying:</div>
          <div className="text-blue-700">{session.topic}</div>
        </div>
      )}

      {/* Curriculum Steps */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Curriculum</h4>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {curriculum.map((step, index) => (
            <CurriculumStepItem
              key={step.id}
              step={step}
              isCurrentStep={index === currentStepIndex}
              stepNumber={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CurriculumStepItemProps {
  step: CurriculumStep;
  isCurrentStep: boolean;
  stepNumber: number;
}

function CurriculumStepItem({ step, isCurrentStep, stepNumber }: CurriculumStepItemProps) {
  return (
    <div
      className={`flex items-start space-x-3 p-2 rounded-lg transition-colors ${
        isCurrentStep
          ? 'bg-blue-50 border border-blue-200'
          : step.completed
          ? 'bg-green-50'
          : 'bg-gray-50'
      }`}
    >
      {/* Step Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {step.completed ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : isCurrentStep ? (
          <Circle className="h-5 w-5 text-blue-600 fill-current" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-medium text-gray-500">Step {stepNumber}</span>
          {step.estimatedDuration && (
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{step.estimatedDuration}</span>
            </div>
          )}
        </div>
        <h5
          className={`font-medium text-sm ${
            isCurrentStep
              ? 'text-blue-900'
              : step.completed
              ? 'text-green-800'
              : 'text-gray-700'
          }`}
        >
          {step.title}
        </h5>
        <p
          className={`text-xs mt-1 ${
            isCurrentStep
              ? 'text-blue-700'
              : step.completed
              ? 'text-green-600'
              : 'text-gray-500'
          }`}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}