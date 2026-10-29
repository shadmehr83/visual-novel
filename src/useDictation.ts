import { useEffect, useRef, useState } from "react";
export function useDictation(append: (text: string) => void) {
  const [listening, setListening] = useState(false),
    [interim, setInterim] = useState(""),
    [error, setError] = useState("");
  const recognition = useRef<any>(null),
    latest = useRef(append);
  latest.current = append;
  useEffect(
    () => () => {
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.onresult = null;
        recognition.current.onerror = null;
        recognition.current.abort();
      }
    },
    [],
  );
  const toggle = () => {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setError(
        "Dictation is unavailable here. Type your request, or use Chrome / Edge with microphone access.",
      );
      return;
    }
    const r = new Recognition();
    recognition.current = r;
    r.lang = navigator.language;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (event: any) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) latest.current(result[0].transcript);
        else pending += result[0].transcript;
      }
      setInterim(pending);
    };
    r.onerror = (event: any) => {
      setError("Dictation: " + event.error + ". You can still type.");
      setListening(false);
      setInterim("");
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    try {
      setError("");
      r.start();
      setListening(true);
    } catch {
      setError("Could not start the microphone. You can still type.");
      setListening(false);
    }
  };
  return { listening, interim, error, toggle };
}
