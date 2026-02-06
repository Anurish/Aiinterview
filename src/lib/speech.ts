/// <reference types="dom-speech-recognition" />
// Web Speech API utilities for voice interviews

export interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function createSpeechRecognition(): SpeechRecognition | null {
    if (typeof window === "undefined") return null;

    const SpeechRecognitionAPI =
        (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ||
        window.SpeechRecognition;

    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    return recognition;
}

export function speakText(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a natural sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
        (v) => v.name.includes("Google") || v.name.includes("Natural") || v.lang.startsWith("en-")
    );
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    if (onEnd) {
        utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
}

export function stopSpeaking(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}
