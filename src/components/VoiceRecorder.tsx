/// <reference types="dom-speech-recognition" />
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Pause, Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSpeechRecognitionSupported, createSpeechRecognition } from "@/lib/speech";

interface VoiceRecorderProps {
    onTranscript: (transcript: string) => void;
    onFinalTranscript: (transcript: string) => void;
    disabled?: boolean;
    className?: string;
}

export function VoiceRecorder({
    onTranscript,
    onFinalTranscript,
    disabled = false,
    className,
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSupported, setIsSupported] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const transcriptRef = useRef<string>("");
    const restartTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setIsSupported(isSpeechRecognitionSupported()); // eslint-disable-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
        };
    }, []);

    const startAudioVisualization = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            const updateLevel = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(average / 255);
                animationRef.current = requestAnimationFrame(updateLevel);
            };

            updateLevel();
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    }, []);

    const stopAudioVisualization = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setAudioLevel(0);
    }, []);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onresult = null as any;
                recognitionRef.current.onend = null as any;
                recognitionRef.current.onerror = null as any;
                recognitionRef.current.stop();
            } catch (e) {}
            recognitionRef.current = null;
        }
        setIsRecording(false);
        setIsPaused(false);
        stopAudioVisualization();
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }
    }, [stopAudioVisualization]);

    const startRecording = useCallback(() => {
        transcriptRef.current = "";
        setTranscript("");

        recognitionRef.current = createSpeechRecognition();
        if (!recognitionRef.current) return;

        recognitionRef.current.onresult = (event) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += result;
                } else {
                    interimTranscript += result;
                }
            }

            if (finalTranscript) {
                transcriptRef.current = transcriptRef.current + finalTranscript + " ";
                setTranscript(transcriptRef.current);
                onFinalTranscript(transcriptRef.current);
            }

            // Send combined (committed + interim) as live transcript
            const combined = transcriptRef.current + interimTranscript;
            onTranscript(combined);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", (event as any).error);
            if ((event as any).error !== "no-speech") {
                stopRecording();
            }
        };

        recognitionRef.current.onend = () => {
            // debounce restart to avoid duplicates
            if (isRecording && !isPaused) {
                if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
                restartTimeoutRef.current = window.setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        stopRecording();
                    }
                }, 250);
            }
        };

        recognitionRef.current.start();
        setIsRecording(true);
        startAudioVisualization();
    }, [isRecording, isPaused, onTranscript, onFinalTranscript, startAudioVisualization, stopRecording]);

    const togglePause = useCallback(() => {
        if (isPaused) {
            recognitionRef.current?.start();
            startAudioVisualization();
        } else {
            recognitionRef.current?.stop();
            stopAudioVisualization();
        }
        setIsPaused(!isPaused);
    }, [isPaused, startAudioVisualization, stopAudioVisualization]);

    const clearTranscript = useCallback(() => {
        transcriptRef.current = "";
        setTranscript("");
        onFinalTranscript("");
    }, [onFinalTranscript]);

    if (!isSupported) {
        return (
            <div className={cn("p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30", className)}>
                <p className="text-sm text-yellow-400">
                    Voice recording is not supported in your browser. Please use Chrome or Edge.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Recording Controls */}
            <div className="flex items-center gap-3">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={disabled}
                    className={cn(
                        "relative flex items-center justify-center h-14 w-14 rounded-full transition-all",
                        isRecording
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {/* Audio level ring */}
                    {isRecording && !isPaused && (
                        <div
                            className="absolute inset-0 rounded-full border-4 border-red-400 animate-pulse"
                            style={{
                                transform: `scale(${1 + audioLevel * 0.3})`,
                                opacity: 0.5 + audioLevel * 0.5,
                            }}
                        />
                    )}
                    {isRecording ? (
                        <MicOff className="h-6 w-6 text-white" />
                    ) : (
                        <Mic className="h-6 w-6 text-white" />
                    )}
                </button>

                {isRecording && (
                    <>
                        <button
                            onClick={togglePause}
                            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            {isPaused ? (
                                <Play className="h-5 w-5 text-white" />
                            ) : (
                                <Pause className="h-5 w-5 text-white" />
                            )}
                        </button>
                        <button
                            onClick={clearTranscript}
                            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <Trash2 className="h-5 w-5 text-white" />
                        </button>
                    </>
                )}

                {/* Status */}
                <div className="flex items-center gap-2">
                    {isRecording && (
                        <>
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"
                            )} />
                            <span className="text-sm text-gray-400">
                                {isPaused ? "Paused" : "Recording..."}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Transcript Display */}
            {transcript && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm font-medium text-gray-400 mb-2">Transcript:</p>
                    <p className="text-white leading-relaxed">{transcript}</p>
                </div>
            )}
        </div>
    );
}
