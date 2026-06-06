// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Native LOCKON AI Chat Panel using local Ollama.

import React, {useState, useRef, useEffect, useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism';
import lockonAiIconUrl from 'images/lockon-ai-icon.svg';
import './lockon_ai.scss';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

const DEFAULT_MODEL = 'gemma4:12b';
const OLLAMA_ENDPOINT = 'http://localhost:11434/api/chat';

const SUGGESTED_PROMPTS = [
    "Summarize this channel",
    "Help me write a React component",
    "Explain a coding concept",
];

const LockonAIPanel: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        // If we are scrolled up more than 50px from bottom, show the button
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShowScrollDown(!isNearBottom);
    };

    useEffect(() => {
        if (!showScrollDown) {
            scrollToBottom();
        }
    }, [messages, showScrollDown, scrollToBottom]);

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const sendPrompt = async (promptText: string) => {
        if (!promptText.trim() || isLoading) return;

        abortControllerRef.current = new AbortController();

        const userMsg: Message = { role: 'user', content: promptText.trim(), timestamp: new Date() };
        const newMessages = [...messages, userMsg];
        
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setError(null);
        setShowScrollDown(false);

        // Add empty assistant message immediately
        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

        try {
            const response = await fetch(OLLAMA_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: DEFAULT_MODEL,
                    messages: newMessages.filter(m => m.role !== 'system').map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    stream: true,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`Ollama API returned ${response.status}: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let assistantContent = '';
            let buffer = '';

            if (reader) {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, {stream: true});
                    const lines = buffer.split('\n');
                    
                    // Keep the last segment in the buffer because it might be incomplete
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message?.content) {
                                assistantContent += parsed.message.content;
                                // Update the last message
                                setMessages(prev => {
                                    const nextMsgs = [...prev];
                                    nextMsgs[nextMsgs.length - 1].content = assistantContent;
                                    return nextMsgs;
                                });
                            }
                        } catch (e) {
                            console.warn('Failed to parse streaming JSON line:', line);
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Generation stopped by user');
            } else {
                console.error('LOCKON AI Error:', err);
                setError(err.message || 'Failed to connect to Ollama. Please ensure it is running on localhost:11434.');
                setMessages(prev => {
                    const nextMsgs = [...prev];
                    if (nextMsgs[nextMsgs.length - 1].content === '') {
                        nextMsgs.pop();
                    }
                    nextMsgs.push({ role: 'system', content: `Error: ${err.message || 'Connection failed.'}`, timestamp: new Date() });
                    return nextMsgs;
                });
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleSend = () => {
        sendPrompt(input);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="lockon-ai-panel">
            <div className="ai-messages" ref={containerRef} onScroll={handleScroll}>
                {messages.length === 0 && (
                    <div className="ai-empty-state">
                        <img src={lockonAiIconUrl} alt="LOCKON AI" className="ai-hero-logo" />
                        <h2>How can I help you today?</h2>
                        <div className="ai-suggested-prompts">
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button key={i} onClick={() => sendPrompt(prompt)} className="ai-prompt-btn">
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div key={index} className={`ai-message-row ${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <div className="ai-avatar">
                                <img src={lockonAiIconUrl} alt="LOCKON AI" />
                            </div>
                        )}
                        <div className={`ai-message-bubble ${msg.role}`}>
                            {msg.role === 'assistant' ? (
                                msg.content === '' && isLoading && index === messages.length - 1 ? (
                                    <div className="ai-loading-dots">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                ) : (
                                    <>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({node, inline, className, children, ...props}: any) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <div className="ai-code-block">
                                                            <div className="ai-code-header">
                                                                <span>{match[1]}</span>
                                                                <button onClick={() => handleCopy(String(children).replace(/\n$/, ''))}>
                                                                    <i className="icon icon-content-copy" /> Copy
                                                                </button>
                                                            </div>
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus as any}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                        <div className="ai-timestamp">{formatTime(msg.timestamp)}</div>
                                    </>
                                )
                            ) : (
                                <>
                                    <div className="ai-message-content">{msg.content}</div>
                                    <div className="ai-timestamp">{formatTime(msg.timestamp)}</div>
                                </>
                            )}

                            {msg.role === 'assistant' && msg.content && !isLoading && (
                                <div className="ai-message-actions">
                                    <button onClick={() => handleCopy(msg.content)} title="Copy Response">
                                        <i className="icon icon-content-copy" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {error && (
                    <div className="ai-error-banner">
                        <i className="icon icon-alert-outline" />
                        <span>{error}</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {showScrollDown && (
                <button className="ai-scroll-bottom-btn" onClick={() => { setShowScrollDown(false); scrollToBottom(); }}>
                    <i className="icon icon-arrow-down" />
                </button>
            )}

            <div className="ai-input-area">
                <textarea
                    placeholder="Ask LOCKON AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                />
                {isLoading ? (
                    <button 
                        className="ai-stop-btn" 
                        onClick={stopGeneration}
                        title="Stop Generation"
                    />
                ) : (
                    <button 
                        className="ai-send-btn" 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                    >
                        <i className="icon icon-send" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default LockonAIPanel;
