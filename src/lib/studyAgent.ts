import { CurriculumStep, Message, StudyPhase } from '../types/session';

export interface StudyAgentConfig {
  maxStepsPerTopic: number;
  questionFrequency: number; // After how many explanations to ask questions
  understandingCheckInterval: number;
}

const DEFAULT_CONFIG: StudyAgentConfig = {
  maxStepsPerTopic: 8,
  questionFrequency: 2,
  understandingCheckInterval: 3,
};

export class StudyAgent {
  private config: StudyAgentConfig;

  constructor(config: Partial<StudyAgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a curriculum for a given topic
   */
  generateCurriculum(topic: string): CurriculumStep[] {
    // This is a simplified curriculum generator
    // In a real implementation, this could use AI/LLM to generate more sophisticated curricula
    const curricula = this.getTopicCurriculum(topic.toLowerCase());
    
    return curricula.map((step, index) => ({
      id: `step-${index + 1}`,
      title: step.title,
      description: step.description,
      order: index + 1,
      completed: false,
      estimatedDuration: step.estimatedDuration || '5-10 minutes',
    }));
  }

  /**
   * Get predefined curriculum templates for common topics
   */
  private getTopicCurriculum(topic: string): Array<{title: string, description: string, estimatedDuration?: string}> {
    const curricula: Record<string, Array<{title: string, description: string, estimatedDuration?: string}>> = {
      'nitrogen cycle': [
        {
          title: 'Introduction to the Nitrogen Cycle',
          description: 'Understanding what nitrogen is and why it\'s essential for life',
          estimatedDuration: '5 minutes'
        },
        {
          title: 'Nitrogen Fixation',
          description: 'How atmospheric nitrogen is converted into ammonia by bacteria',
          estimatedDuration: '8 minutes'
        },
        {
          title: 'Nitrification Process',
          description: 'Converting ammonia to nitrites and then to nitrates',
          estimatedDuration: '7 minutes'
        },
        {
          title: 'Assimilation by Plants',
          description: 'How plants absorb and use nitrogen compounds',
          estimatedDuration: '6 minutes'
        },
        {
          title: 'Decomposition and Mineralization',
          description: 'Breaking down organic matter to release nitrogen',
          estimatedDuration: '6 minutes'
        },
        {
          title: 'Denitrification',
          description: 'Converting nitrates back to atmospheric nitrogen',
          estimatedDuration: '7 minutes'
        },
        {
          title: 'Human Impact on Nitrogen Cycle',
          description: 'How human activities affect the natural nitrogen cycle',
          estimatedDuration: '8 minutes'
        },
        {
          title: 'Review and Applications',
          description: 'Connecting all concepts and real-world applications',
          estimatedDuration: '10 minutes'
        }
      ],
      'photosynthesis': [
        {
          title: 'What is Photosynthesis?',
          description: 'Basic definition and importance of photosynthesis',
        },
        {
          title: 'Light-Dependent Reactions',
          description: 'Understanding the photo part of photosynthesis',
        },
        {
          title: 'Calvin Cycle (Light-Independent)',
          description: 'How plants make glucose from CO2',
        },
        {
          title: 'Factors Affecting Photosynthesis',
          description: 'Light, temperature, and CO2 concentration effects',
        },
        {
          title: 'Photosynthesis vs Cellular Respiration',
          description: 'Comparing and contrasting these vital processes',
        }
      ],
      'cellular respiration': [
        {
          title: 'Overview of Cellular Respiration',
          description: 'Introduction to how cells generate energy',
        },
        {
          title: 'Glycolysis',
          description: 'Breaking down glucose in the cytoplasm',
        },
        {
          title: 'Krebs Cycle',
          description: 'The citric acid cycle in mitochondria',
        },
        {
          title: 'Electron Transport Chain',
          description: 'Final stage of ATP production',
        },
        {
          title: 'Anaerobic Respiration',
          description: 'Fermentation and energy production without oxygen',
        }
      ]
    };

    // Try to find exact match first
    if (curricula[topic]) {
      return curricula[topic];
    }

    // Try to find partial matches
    for (const [key, curriculum] of Object.entries(curricula)) {
      if (topic.includes(key) || key.includes(topic)) {
        return curriculum;
      }
    }

    // Default generic curriculum for unknown topics
    return [
      {
        title: `Introduction to ${topic}`,
        description: `Basic concepts and definitions related to ${topic}`,
      },
      {
        title: `Key Components of ${topic}`,
        description: `Main elements and parts that make up ${topic}`,
      },
      {
        title: `How ${topic} Works`,
        description: `Processes and mechanisms involved in ${topic}`,
      },
      {
        title: `Applications and Importance`,
        description: `Real-world applications and significance of ${topic}`,
      },
      {
        title: `Common Misconceptions`,
        description: `Addressing frequent misunderstandings about ${topic}`,
      },
      {
        title: `Review and Summary`,
        description: `Consolidating knowledge and key takeaways`,
      }
    ];
  }

  /**
   * Generate the initial curriculum presentation message
   */
  generateCurriculumMessage(topic: string, curriculum: CurriculumStep[]): Message {
    const curriculumList = curriculum
      .map((step, index) => `${index + 1}. **${step.title}** (${step.estimatedDuration})\n   ${step.description}`)
      .join('\n\n');

    const content = `Great! I'll help you learn about **${topic}**. I've created a personalized curriculum that will guide you through this topic step by step.

## 📚 Learning Plan for "${topic}"

${curriculumList}

---

**Total estimated time:** ${this.calculateTotalDuration(curriculum)}

This curriculum is designed to build your understanding progressively. I'll explain each concept thoroughly, check your understanding along the way, and answer any questions you have.

**Are you ready to begin, or would you like me to modify any part of this learning plan?**`;

    return {
      id: Date.now().toString(),
      content,
      isUser: false,
      timestamp: new Date(),
      type: 'curriculum',
    };
  }

  /**
   * Generate explanation content for a curriculum step
   */
  generateStepExplanation(step: CurriculumStep, topic: string): Message {
    // This would ideally use an LLM to generate detailed explanations
    // For now, using template-based content
    const explanations = this.getStepExplanations(topic.toLowerCase(), step.title);
    
    const content = `## 📖 ${step.title}

${explanations}

---

**Do you have any questions about this concept, or shall I continue with the next topic?**`;

    return {
      id: Date.now().toString(),
      content,
      isUser: false,
      timestamp: new Date(),
      type: 'message',
    };
  }

  /**
   * Generate understanding check questions
   */
  generateUnderstandingCheck(step: CurriculumStep): Message {
    const questions = [
      `Can you explain ${step.title.toLowerCase()} in your own words?`,
      `What's the most important thing you learned about ${step.title.toLowerCase()}?`,
      `How does ${step.title.toLowerCase()} relate to what we discussed earlier?`,
      `What questions do you still have about ${step.title.toLowerCase()}?`
    ];

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    const content = `## 🤔 Understanding Check

${randomQuestion}

Take your time to think about it. This helps reinforce your learning!`;

    return {
      id: Date.now().toString(),
      content,
      isUser: false,
      timestamp: new Date(),
      type: 'understanding_check',
    };
  }

  /**
   * Generate phase transition messages
   */
  generatePhaseTransition(fromPhase: string, toPhase: string, context?: string): Message {
    const transitions: Record<string, string> = {
      'planning_to_teaching': `Perfect! Now let's dive into the learning material. I'll guide you through each step of the curriculum.`,
      'teaching_to_questioning': `Great progress! Let me check your understanding before we continue.`,
      'questioning_to_teaching': `Excellent! ${context || 'Let\'s continue with the next topic.'}`,
      'teaching_to_completed': `🎉 Congratulations! You've completed the entire curriculum. You now have a solid understanding of this topic!`,
    };

    const key = `${fromPhase}_to_${toPhase}`;
    const content = transitions[key] || `Moving from ${fromPhase} to ${toPhase} phase.`;

    return {
      id: Date.now().toString(),
      content,
      isUser: false,
      timestamp: new Date(),
      type: 'phase_transition',
    };
  }

  /**
   * Calculate total estimated duration
   */
  private calculateTotalDuration(curriculum: CurriculumStep[]): string {
    const totalMinutes = curriculum.reduce((total, step) => {
      const duration = step.estimatedDuration || '5-10 minutes';
      const match = duration.match(/(\d+)(?:-(\d+))?\s*minutes?/);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        return total + Math.round((min + max) / 2);
      }
      return total + 7; // default 7 minutes
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  }

  /**
   * Get detailed explanations for specific steps (template-based)
   */
  private getStepExplanations(topic: string, stepTitle: string): string {
    const explanations: Record<string, Record<string, string>> = {
      'nitrogen cycle': {
        'Introduction to the Nitrogen Cycle': `
The nitrogen cycle is one of Earth's most important biogeochemical cycles. Here's what you need to know:

**What is Nitrogen?**
- Nitrogen (N₂) makes up about 78% of our atmosphere
- It's essential for all living organisms as a building block of proteins, DNA, and RNA
- However, most organisms cannot use atmospheric nitrogen directly

**Why is the Nitrogen Cycle Important?**
- Converts nitrogen between different chemical forms
- Makes nitrogen available to living organisms
- Maintains the balance of nitrogen in ecosystems
- Critical for plant growth and food production

**The Big Picture:**
The nitrogen cycle involves several key processes that transform nitrogen from the atmosphere into forms that living organisms can use, and eventually back to the atmosphere. Think of it as nature's recycling system for nitrogen!`,

        'Nitrogen Fixation': `
Nitrogen fixation is the first crucial step in making atmospheric nitrogen available to living organisms.

**What Happens:**
- Atmospheric nitrogen (N₂) is converted into ammonia (NH₃) or ammonium (NH₄⁺)
- This breaks the strong triple bond between nitrogen atoms
- The process requires a lot of energy

**Who Does It:**
1. **Nitrogen-fixing bacteria** (most important):
   - Free-living bacteria in soil (like Azotobacter)
   - Symbiotic bacteria in root nodules (like Rhizobium in legumes)
   
2. **Industrial processes** (Haber-Bosch process for fertilizers)

3. **Lightning** (provides energy to break N₂ bonds)

**Key Enzyme:**
- Nitrogenase enzyme enables this process
- Only works in oxygen-free environments
- This is why root nodules create oxygen-free zones

**Real-world Example:**
Ever notice how farmers often plant soybeans or other legumes? These plants have nitrogen-fixing bacteria in their roots, naturally fertilizing the soil!`,

        'Nitrification Process': `
Nitrification is a two-step oxidation process that converts ammonia into nitrates.

**Step 1: Ammonia to Nitrite**
- Ammonia-oxidizing bacteria (like Nitrosomonas) convert NH₃ to NO₂⁻
- Chemical equation: NH₃ + O₂ → NO₂⁻ + H₂O + H⁺

**Step 2: Nitrite to Nitrate**
- Nitrite-oxidizing bacteria (like Nitrobacter) convert NO₂⁻ to NO₃⁻  
- Chemical equation: NO₂⁻ + ½O₂ → NO₃⁻

**Why This Matters:**
- Nitrates (NO₃⁻) are the primary form of nitrogen that plants absorb
- This process happens in soil and water
- Both steps release energy that bacteria use for growth

**Environmental Impact:**
- Too much nitrification can lead to soil acidification
- Excess nitrates can leach into groundwater
- Important in wastewater treatment processes

**Memory Tip:**
Think "Nitrification = Making Nitrates" - it's the process that creates the nitrogen form most plants prefer!`
      }
    };

    return explanations[topic]?.[stepTitle] || `This is where I would provide a detailed explanation of ${stepTitle}. In a full implementation, this would use an AI language model to generate comprehensive, accurate explanations tailored to the student's level.`;
  }
}

export const studyAgent = new StudyAgent();