import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from './ChatMessage';
import { db, analytics } from '../firebase/config';
// FIX: Use Firebase v9 compat API instead of v9 modular imports.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
// import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
// import { logEvent } from 'firebase/analytics';


export const AITutor = ({ user }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const chatContainerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Effect for Firestore real-time updates
    useEffect(() => {
        if (user) {
            // FIX: Use Firebase v8 collection/query API.
            const messagesRef = db.collection('users').doc(user.uid).collection('messages');
            const q = messagesRef.orderBy('timestamp', 'asc');

            // FIX: Use Firebase v8 onSnapshot method.
            const unsubscribe = q.onSnapshot((querySnapshot) => {
                const history = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
                setChatHistory(history);
            }, (err) => {
                console.error("Firestore snapshot error:", err);
                setError("Could not load chat history.");
            });

            return () => unsubscribe(); // Unsubscribe on cleanup
        }
    }, [user]);


    // Effect for speech recognition setup
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setPrompt(prevPrompt => prevPrompt ? `${prevPrompt} ${transcript}` : transcript);
                recognitionRef.current.stop();
            };
            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setError(`Speech recognition error: ${event.error}`);
                setIsListening(false);
            };
            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Effect for auto-scrolling chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);
    
    const handleMicClick = () => {
        if (!recognitionRef.current) {
            alert("Sorry, your browser does not support voice recognition.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading || !user) return;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const userMessage = { role: 'user', text: prompt };
        // FIX: Use Firebase v8 collection API.
        const messagesRef = db.collection('users').doc(user.uid).collection('messages');
        
        setPrompt('');
        setIsLoading(true);
        setError(null);
        
        try {
            // Save user message to Firestore
            // FIX: Use Firebase v8 add() method and serverTimestamp.
            await messagesRef.add({ ...userMessage, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            analytics.then(instance => {
                // FIX: Use Firebase v8 instance.logEvent() method.
                if (instance) instance.logEvent('send_message', { user_id: user.uid });
            });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userMessage.text,
                config: {
                    systemInstruction: "You are an expert engineering tutor. Provide clear, step-by-step, cited answers. Format responses using Markdown, especially for lists and code blocks for equations.",
                    tools: [{ googleSearch: {} }],
                },
            });

            const aiText = response.text;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources = groundingChunks
                .map(chunk => chunk.web)
                .filter(Boolean)
                .map(web => ({ title: web.title, uri: web.uri }))
                .filter((source, index, self) => index === self.findIndex((s) => s.uri === source.uri));

            const aiMessage = { role: 'model', text: aiText, sources: sources };
            
            // Save AI message to Firestore
            // FIX: Use Firebase v8 add() method and serverTimestamp.
            await messagesRef.add({ ...aiMessage, timestamp: firebase.firestore.FieldValue.serverTimestamp() });

        } catch (e) {
            console.error("Gemini API error", e);
            const errorMessageText = `Sorry, I encountered an error. Please check the browser console for details. (Error: ${e.message})`;
            const errorMessage = { role: 'model', text: errorMessageText, sources: [] };
             // Save error message to Firestore
            // FIX: Use Firebase v8 add() method and serverTimestamp.
            await messagesRef.add({ ...errorMessage, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            setError(errorMessageText);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4">
            <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4 text-center md:text-left">Grounded AI Tutor</h1>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
                {chatHistory.length === 0 && !isLoading && <div className="text-gray-400 dark:text-gray-500 text-center mt-8">Ask an engineering question to get started!</div>}
                {chatHistory.map((msg) => <ChatMessage key={msg.id} msg={msg} /> )}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 animate-pulse">Thinking...</div></div>}
            </div>
            {error && <div className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/50 rounded-md mt-2">{error}</div>}
            <form onSubmit={handleSendMessage} className="mt-4 flex items-start flex-shrink-0">
                <textarea
                    value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Derive the formula for a short column's buckling load."
                    className="flex-grow bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 resize-none text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3} disabled={isLoading}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                />
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className={`ml-2 p-3 rounded-md transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
                        isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    aria-label={isListening ? 'Stop recording' : 'Start recording'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </button>
                <button type="submit" disabled={isLoading || !prompt.trim()} className="ml-2 bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-md transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
        </div>
    );
};