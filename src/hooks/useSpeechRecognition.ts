import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(onFinal: (text: string) => void) {
  const supported = getRecognitionConstructor() !== null;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<Recognition | null>(null);
  const wantListeningRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const launch = useCallback(() => {
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return;
    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) onFinalRef.current(result[0].transcript.trim());
        else pending += result[0].transcript;
      }
      setInterim(pending.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        wantListeningRef.current = false;
        setListening(false);
        setError("Microphone access was blocked. Type your answers instead.");
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      if (wantListeningRef.current) recognition.start();
      else setListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const start = useCallback(() => {
    setError(null);
    wantListeningRef.current = true;
    setListening(true);
    launch();
  }, [launch]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    setListening(false);
    setInterim("");
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.abort();
  }, []);

  const reset = useCallback(() => {
    setInterim("");
    if (!wantListeningRef.current) return;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.abort();
    launch();
  }, [launch]);

  useEffect(() => stop, [stop]);

  return { supported, listening, interim, error, start, stop, reset };
}
