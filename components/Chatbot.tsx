import React, { useState, useRef, useEffect, FormEvent } from "react";
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from "../types";
import {
  UserIcon,
  SparklesIcon,
  SendIcon,
  MicrophoneIcon,
  SpeakerOnIcon,
  SpeakerOffIcon,
} from "./icons/Icons";

// FIX: Add types for SpeechRecognition API to the window object.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const CHAT_HISTORY_KEY = "gemini-chat-history";

const BlinkingCursor = () => (
  <span className="inline-block w-2 h-4 bg-slate-400 animate-pulse ml-1 rounded-sm" />
);

const Chatbot: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition to handle vendor prefixes

  // Load history from localStorage on initial render
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to load chat history:", error);
      return [];
    }
  });

  // Function to speak text
  const speak = (text: string) => {
    if (isMuted || !text) return;
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserInput(finalTranscript + interimTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize Chat and set initial message if history is empty
  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction:
          "You are a friendly and helpful AI assistant. Keep your responses concise and informative.",
      },
    });

    if (history.length === 0) {
      const initialMessage = "Hello! How can I assist you today?";
      setHistory([{ role: "model", text: initialMessage }]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [history]);

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleToggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    window.speechSynthesis.cancel(); // Stop speaking when user sends a new message

    const userMessage: ChatMessage = { role: "user", text: userInput };
    const currentInput = userInput;

    setIsLoading(true);
    setUserInput("");
    setHistory((prev) => [...prev, userMessage, { role: "model", text: "" }]);

    try {
      const stream = await chatRef.current.sendMessageStream({
        message: currentInput,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text = fullResponse;
          return newHistory;
        });
      }
      speak(fullResponse);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].text = errorMessage;
        return newHistory;
      });
      speak(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (!isMuted) {
      // If it was unmuted, and we are muting it
      window.speechSynthesis.cancel();
    }
  };

  return (
    // **UPDATED CLASS:** height reduced to h-[400px]
    <div className="bg-slate-800/50 rounded-lg shadow-2xl animate-fade-in flex flex-col h-[400px] border border-slate-700">
      <div className="p-4 border-b border-slate-700 bg-slate-800/70 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold text-lg">AI Assistant</h3>
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
        </button>
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900/60"
      >
        {history.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`p-2 rounded-full self-start text-white ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
                  : "bg-slate-700"
              }`}
            >
              {msg.role === "model" ? (
                <SparklesIcon className="w-6 h-6" />
              ) : (
                <UserIcon className="w-6 h-6" />
              )}
            </div>
            <div
              className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none prose-p:m-0 whitespace-pre-wrap">
                {msg.text}
                {isLoading &&
                  msg.role === "model" &&
                  index === history.length - 1 && <BlinkingCursor />}
              </div>
            </div>
          </div>
        ))}
        
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
            className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-full text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleToggleListen}
            disabled={isLoading}
            className={`p-3 rounded-full hover:opacity-90 disabled:opacity-50 transition-all duration-200 ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-slate-600 text-slate-200"
            }`}
          >
            <MicrophoneIcon />
          </button>
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold p-3 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 shadow-sm"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
