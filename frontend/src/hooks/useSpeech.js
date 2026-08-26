import { useCallback, useRef, useState } from 'react';

export function useSpeech({ onResult, onEnd } = {}) {
    const [isListening, setIsListening] = useState(false);

    const [isSupported] = useState(
        () =>
            typeof window !== 'undefined' &&
            (
                'webkitSpeechRecognition' in window ||
                'SpeechRecognition' in window
            )
    );

    const recognitionRef = useRef(null);
    const accumulatedRef = useRef('');

    const start = useCallback(() => {
        if (!isSupported || isListening) {
            return;
        }

        const SR =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        const recognition = new SR();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
            let final = '';
            let interim = '';

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const transcript =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    final += `${transcript} `;
                    accumulatedRef.current += `${transcript} `;
                } else {
                    interim += transcript;
                }
            }

            onResult?.({
                final,
                interim,
                accumulated: accumulatedRef.current,
            });
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            onEnd?.(accumulatedRef.current);
        };

        recognition.start();
        setIsListening(true);
    }, [isSupported, isListening, onResult, onEnd]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const reset = useCallback(() => {
        stop();
        accumulatedRef.current = '';
    }, [stop]);

    return {
        isListening,
        isSupported,
        start,
        stop,
        reset,
    };
}
