export type InterviewPhase = 'intro' | 'problem' | 'hints' | 'coding' | 'review' | 'success';

export interface ChatMessage {
    id: string;
    role: 'interviewer' | 'candidate' | 'system';
    content: string;
    timestamp: number;
    type?: 'text' | 'code' | 'success' | 'error';
}

export interface InterviewState {
    phase: InterviewPhase;
    messages: ChatMessage[];
    isAiTyping: boolean;
    currentHintIndex: number;
}
