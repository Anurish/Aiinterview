import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, InterviewState, InterviewPhase } from '@/types/interview';

interface LessonContent {
    title: string;
    description: string;
    content: string; // Markdown content
}

export function useAiInterviewer(lesson: LessonContent) {
    const [state, setState] = useState<InterviewState>({
        phase: 'intro',
        messages: [],
        isAiTyping: false,
        currentHintIndex: 0,
    });

    const addMessage = useCallback((role: 'interviewer' | 'candidate', content: string, type: ChatMessage['type'] = 'text') => {
        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substring(7),
            role,
            content,
            timestamp: Date.now(),
            type,
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage],
            isAiTyping: false,
        }));
    }, []);

    const simulateAiTyping = useCallback(async (content: string, delay = 1000) => {
        setState(prev => ({ ...prev, isAiTyping: true }));
        await new Promise(resolve => setTimeout(resolve, delay));
        addMessage('interviewer', content);
    }, [addMessage]);

    // Initial greeting
    useEffect(() => {
        if (state.messages.length === 0) {
            simulateAiTyping(`Hi! I'm your AI interviewer. Today we're going to work on "${lesson.title}".\n\nAre you ready to see the problem statement?`);
        }
    }, [lesson.title, simulateAiTyping]);

    const handleUserMessage = useCallback(async (content: string) => {
        // Add user message
        addMessage('candidate', content);

        // Simple state machine for demo
        // In a real app, this would call an LLM API

        setState(prev => ({ ...prev, isAiTyping: true }));
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking

        if (state.phase === 'intro') {
            const lowerContent = content.toLowerCase();
            if (lowerContent.includes('ready') || lowerContent.includes('yes') || lowerContent.includes('ok') || lowerContent.includes('start')) {
                setState(prev => ({ ...prev, phase: 'problem', isAiTyping: false }));
                // Show full description and content (problem statement)
                addMessage('interviewer', `Great! Here is the problem:\n\n${lesson.description}\n\n---\n\n${lesson.content}`);
                setTimeout(() => {
                    simulateAiTyping("Take your time to read it. When you're ready to start coding, just let me know if you have questions, or start typing in the editor.");
                }, 1000);
            } else {
                addMessage('interviewer', "No rush. I'm here when you're ready. Just type 'ready' to begin.");
            }
        }
        else if (state.phase === 'problem' || state.phase === 'hints') {
            const lowerContent = content.toLowerCase();

            if (lowerContent.includes('hint') || lowerContent.includes('stuck') || lowerContent.includes('help')) {
                setState(prev => ({ ...prev, phase: 'hints' }));
                addMessage('interviewer', "Think about the input and output requirements. \n\n1. What are the edge cases?\n2. Can you iterate through the data?\n3. Do you need a temporary variable?");
            }
            else if (lowerContent.includes('explain') || lowerContent.includes('understand')) {
                addMessage('interviewer', "The goal is to implement the function according to the requirements above. \n\nNeed a specific hint about the algorithm?");
            }
            else if (lowerContent.includes('solution') || lowerContent.includes('answer')) {
                addMessage('interviewer', "I can't give you the full solution yet! Try to break it down. What's the first step?");
            }
            else {
                // Context-aware fallback
                addMessage('interviewer', "I see. How would you express that in code? I'm watching the editor.");
            }
        }
        else {
            addMessage('interviewer', "I'm analyzing your input... You can continue coding.");
        }

    }, [state.phase, lesson, addMessage, simulateAiTyping]);

    const handleCodeExecution = useCallback(async (success: boolean, output: string[], error?: string) => {
        setState(prev => ({ ...prev, isAiTyping: true }));
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (success) {
            setState(prev => ({ ...prev, phase: 'success' }));
            addMessage('interviewer', "Excellent work! Your solution passed all test cases. The output looks correct.", 'success');
            setTimeout(() => {
                simulateAiTyping("You've mastered this concept. Ready for the next challenge?");
            }, 1000);
        } else {
            // Error handling
            if (error) {
                addMessage('interviewer', `I see an error in your execution:\n\`${error}\`\n\nCheck your syntax and try again.`, 'error');
            } else {
                addMessage('interviewer', "The code ran, but the output isn't quite what we expect. Check the requirements again.");
            }
        }
    }, [addMessage, simulateAiTyping]);

    return {
        state,
        handleUserMessage,
        handleCodeExecution
    };
}
