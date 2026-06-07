// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Native LOCKON AI Chat Panel using local Ollama.

import React, {useState, useRef, useEffect, useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useSelector} from 'react-redux';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getPostsInCurrentChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {TrashCanOutlineIcon, CogOutlineIcon} from '@mattermost/compass-icons/components';

import lockonAiIconUrl from 'images/lockon-ai-icon.svg';
import './lockon_ai.scss';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

const DEFAULT_MODEL = 'gemma4:12b';
const DEFAULT_ENDPOINT = 'http://localhost:11434/api/chat';
const DEFAULT_MAX_TOKENS = 8192;

// Simple token estimation: ~1 token per 4 characters
const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

const summarizeOlderMessages = (msgs: Message[], maxTokens: number): {role: string; content: string}[] => {
    // Calculate tokens for all messages
    const totalTokens = msgs.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    
    if (totalTokens <= maxTokens * 0.7) {
        // Under 70% limit — send everything as-is
        return msgs.map(m => ({role: m.role, content: m.content}));
    }

    // Keep most recent messages that fit within 60% of budget
    const recentBudget = maxTokens * 0.6;
    const recentMsgs: Message[] = [];
    let recentTokens = 0;
    
    for (let i = msgs.length - 1; i >= 0; i--) {
        const tokens = estimateTokens(msgs[i].content);
        if (recentTokens + tokens > recentBudget) break;
        recentMsgs.unshift(msgs[i]);
        recentTokens += tokens;
    }

    // Summarize older messages into a condensed form
    const olderMsgs = msgs.slice(0, msgs.length - recentMsgs.length);
    if (olderMsgs.length === 0) {
        return recentMsgs.map(m => ({role: m.role, content: m.content}));
    }

    const summary = olderMsgs.map(m => {
        const prefix = m.role === 'user' ? 'User' : 'AI';
        // Truncate each old message to ~100 chars
        const short = m.content.length > 100 ? m.content.slice(0, 100) + '...' : m.content;
        return `${prefix}: ${short}`;
    }).join('\n');

    return [
        {role: 'system', content: `[Conversation Summary]\n${summary}`},
        ...recentMsgs.map(m => ({role: m.role, content: m.content})),
    ];
};

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
    
    // Settings state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [modelName, setModelName] = useState(() => localStorage.getItem('lockon_ai_model') || DEFAULT_MODEL);
    const [endpointUrl, setEndpointUrl] = useState(() => localStorage.getItem('lockon_ai_endpoint') || DEFAULT_ENDPOINT);
    const [maxContextTokens, setMaxContextTokens] = useState(() => {
        const stored = localStorage.getItem('lockon_ai_max_tokens');
        return stored ? parseInt(stored, 10) : DEFAULT_MAX_TOKENS;
    });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Redux Context
    const currentChannel = useSelector(getCurrentChannel);
    const channelPosts = useSelector(getPostsInCurrentChannel);
    const currentUser = useSelector(getCurrentUser);

    useEffect(() => {
        localStorage.setItem('lockon_ai_model', modelName);
        localStorage.setItem('lockon_ai_endpoint', endpointUrl);
        localStorage.setItem('lockon_ai_max_tokens', String(maxContextTokens));
    }, [modelName, endpointUrl, maxContextTokens]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShowScrollDown(!isNearBottom);
    };

    useEffect(() => {
        if (!showScrollDown && !isSettingsOpen) {
            scrollToBottom();
        }
    }, [messages, showScrollDown, scrollToBottom, isSettingsOpen]);

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
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
        setIsSettingsOpen(false);

        // Add empty assistant message immediately
        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

        // Build System Prompt with Context
        let systemMsgContent = 'You are LOCKON AI, a helpful AI assistant in LOCKON Workspace.';
        if (currentChannel && channelPosts && currentUser) {
            const recentPosts = [...channelPosts].slice(0, 50).reverse();
            const messagesText = recentPosts.map((p: any) => `- ${p.message}`).join('\n');
            
            systemMsgContent = `You are LOCKON AI, a helpful AI assistant. You are currently assisting user "@${currentUser.username}".
Context: You are in the channel "${currentChannel.display_name}".
Here are the most recent messages in this channel:
${messagesText}

Use this context to accurately answer the user's prompt.`;
        }

        // Build conversation history with smart token management
        const conversationMsgs = newMessages.filter(m => m.role !== 'system');
        const managedHistory = summarizeOlderMessages(conversationMsgs, maxContextTokens);

        const ollamaMessages = [
            { role: 'system', content: systemMsgContent },
            ...managedHistory,
        ];

        // Token usage for display
        const totalTokens = ollamaMessages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
        console.log(`[LOCKON AI] Token usage: ~${totalTokens}/${maxContextTokens} (${Math.round(totalTokens / maxContextTokens * 100)}%)`);

        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: ollamaMessages,
                    stream: true,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
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
                    
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message?.content) {
                                assistantContent += parsed.message.content;
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
                setError(err.message || 'Failed to connect to API.');
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
            <div className="ai-header-controls">
                <button className="ai-header-btn" onClick={clearChat} title="Clear Chat">
                    <TrashCanOutlineIcon size={18} />
                </button>
                <button className="ai-header-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)} title="Settings">
                    <CogOutlineIcon size={18} />
                </button>
            </div>

            {isSettingsOpen ? (
                <div className="ai-settings-inline">
                    <h3>AI Configuration</h3>
                    <p className="ai-settings-desc">Adjust the settings for your local LOCKON AI companion.</p>
                    
                    <details className="ai-advanced-settings">
                        <summary>Advanced Configuration</summary>
                        <div className="ai-settings-group">
                            <label>Endpoint URL</label>
                            <input 
                                type="text" 
                                value={endpointUrl} 
                                onChange={(e) => setEndpointUrl(e.target.value)} 
                                placeholder="http://localhost:11434/api/chat"
                            />
                        </div>
                        
                        <div className="ai-settings-group">
                            <label>Model Name</label>
                            <input 
                                type="text" 
                                value={modelName} 
                                onChange={(e) => setModelName(e.target.value)} 
                                placeholder="gemma4:12b"
                            />
                        </div>
                    </details>

                    <div className="ai-settings-group">
                        <label>Max Context Tokens</label>
                        <div className="ai-settings-slider-row">
                            <input 
                                type="range" 
                                min="2048"
                                max="32768"
                                step="1024"
                                value={maxContextTokens} 
                                onChange={(e) => setMaxContextTokens(parseInt(e.target.value, 10))}
                                className="ai-settings-slider"
                                style={{ '--slider-fill': `${((maxContextTokens - 2048) / (32768 - 2048)) * 100}%` } as any}
                            />
                            <span className="ai-settings-slider-value">{maxContextTokens.toLocaleString()}</span>
                        </div>
                        <p className="ai-settings-hint">Lower values save memory. Higher values let AI remember more conversation history.</p>
                    </div>

                    <div className="ai-settings-info">
                        <i className="icon icon-information-outline" />
                        <span>The AI reads the last 50 messages of the current channel for context. Old conversation turns are automatically summarized when approaching the token limit.</span>
                    </div>

                    <button className="ai-settings-close-btn" onClick={() => setIsSettingsOpen(false)}>
                        Done
                    </button>
                </div>
            ) : (
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
            )}

            {!isSettingsOpen && showScrollDown && (
                <button className="ai-scroll-bottom-btn" onClick={() => { setShowScrollDown(false); scrollToBottom(); }}>
                    <i className="icon icon-arrow-down" />
                </button>
            )}

            {!isSettingsOpen && (
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
                        >
                            <i className="icon icon-stop" />
                        </button>
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
            )}
        </div>
    );
};

export default LockonAIPanel;
