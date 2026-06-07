// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Inline AI response widget displayed below a post.

import React, {useState, useEffect, useCallback, useRef} from 'react';
import ReactDOM from 'react-dom';

import lockonAiIconUrl from 'images/lockon-ai-icon.svg';

import './lockon_ai_inline.scss';

interface AIInlineResult {
    postId: string;
    action: string;
    content: string;
    isLoading: boolean;
}

const OLLAMA_ENDPOINT_KEY = 'lockon_ai_endpoint';
const OLLAMA_MODEL_KEY = 'lockon_ai_model';
const DEFAULT_ENDPOINT = 'http://localhost:11434/api/chat';
const DEFAULT_MODEL = 'gemma4:12b';

const ACTION_PROMPTS: Record<string, (msg: string) => string> = {
    translate: (msg) =>
        `Translate the following message. If it is in Thai, translate to English. If it is in English or another language, translate to Thai. Only output the translation, nothing else.\n\nMessage:\n${msg}`,
    summarize: (msg) =>
        `Summarize the following message in 1-3 concise bullet points. Keep it very short.\n\nMessage:\n${msg}`,
    explain: (msg) =>
        `Explain the following message clearly and concisely. If it contains code, explain what the code does. Keep the explanation brief.\n\nMessage:\n${msg}`,
};

const LockonAIInlineWidget: React.FC = () => {
    const [results, setResults] = useState<Record<string, AIInlineResult>>({});
    const resultsRef = useRef<Record<string, AIInlineResult>>({});
    const abortControllers = useRef<Record<string, AbortController>>({});

    // Keep ref in sync with state to avoid stale closures in useCallback
    useEffect(() => {
        resultsRef.current = results;
    }, [results]);

    const handleAIAction = useCallback(async (event: Event) => {
        const detail = (event as CustomEvent).detail as {postId: string; action: string; message: string};
        if (!detail?.postId || !detail?.action || !detail?.message) {
            return;
        }

        const {postId, action, message} = detail;
        const key = `${postId}_${action}`;

        // If this action is already showing result, toggle it off
        const currentResults = resultsRef.current;
        if (currentResults[key] && !currentResults[key].isLoading) {
            setResults((prev) => {
                const next = {...prev};
                delete next[key];
                return next;
            });
            return;
        }

        // Cancel any existing request for this key
        if (abortControllers.current[key]) {
            abortControllers.current[key].abort();
        }

        const controller = new AbortController();
        abortControllers.current[key] = controller;

        setResults((prev) => ({
            ...prev,
            [key]: {postId, action, content: '', isLoading: true},
        }));

        const endpoint = localStorage.getItem(OLLAMA_ENDPOINT_KEY) || DEFAULT_ENDPOINT;
        const model = localStorage.getItem(OLLAMA_MODEL_KEY) || DEFAULT_MODEL;
        const promptFn = ACTION_PROMPTS[action];
        if (!promptFn) {
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    model,
                    messages: [
                        {role: 'system', content: 'You are LOCKON AI, a helpful assistant in LOCKON Workspace. Be concise.'},
                        {role: 'user', content: promptFn(message)},
                    ],
                    stream: true,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`API error ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullContent = '';
            let buffer = '';

            if (reader) {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) {
                        break;
                    }

                    buffer += decoder.decode(value, {stream: true});
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim()) {
                            continue;
                        }
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message?.content) {
                                fullContent += parsed.message.content;
                                setResults((prev) => ({
                                    ...prev,
                                    [key]: {postId, action, content: fullContent, isLoading: true},
                                }));
                            }
                        } catch {
                            // skip malformed JSON lines
                        }
                    }
                }
            }

            setResults((prev) => ({
                ...prev,
                [key]: {postId, action, content: fullContent, isLoading: false},
            }));
        } catch (err: any) {
            if (err.name === 'AbortError') {
                return;
            }
            setResults((prev) => ({
                ...prev,
                [key]: {postId, action, content: `Error: ${err.message}`, isLoading: false},
            }));
        } finally {
            delete abortControllers.current[key];
        }
    }, []);

    useEffect(() => {
        window.addEventListener('lockon-ai-action', handleAIAction);
        return () => {
            window.removeEventListener('lockon-ai-action', handleAIAction);
            // Cleanup all abort controllers
            Object.values(abortControllers.current).forEach((c) => c.abort());
        };
    }, [handleAIAction]);

    const handleDismiss = (key: string) => {
        if (abortControllers.current[key]) {
            abortControllers.current[key].abort();
        }
        setResults((prev) => {
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Render results as floating portals next to each post
    const resultElements = Object.entries(results).map(([key, result]) => {
        const postElement = document.querySelector(`[id="post_${result.postId}"], [id="rhsPost_${result.postId}"]`);
        if (!postElement) {
            return null;
        }

        const actionLabel = result.action === 'translate' ? '🌐 Translation' :
            result.action === 'summarize' ? '📝 Summary' :
                '💡 Explanation';

        return ReactDOM.createPortal(
            <div className='lockon-ai-inline-result' key={key}>
                <div className='lockon-ai-inline-header'>
                    <div className='lockon-ai-inline-label'>
                        <img src={lockonAiIconUrl} alt='AI' className='lockon-ai-inline-icon'/>
                        <span>{actionLabel}</span>
                    </div>
                    <div className='lockon-ai-inline-actions'>
                        {!result.isLoading && result.content && (
                            <button
                                className='lockon-ai-inline-btn'
                                onClick={() => handleCopy(result.content)}
                                title='Copy'
                            >
                                <i className='icon icon-content-copy'/>
                            </button>
                        )}
                        <button
                            className='lockon-ai-inline-btn'
                            onClick={() => handleDismiss(key)}
                            title='Dismiss'
                        >
                            <i className='icon icon-close'/>
                        </button>
                    </div>
                </div>
                <div className='lockon-ai-inline-body'>
                    {result.isLoading && !result.content ? (
                        <div className='lockon-ai-inline-loading'>
                            <span className='dot'/>
                            <span className='dot'/>
                            <span className='dot'/>
                        </div>
                    ) : (
                        <p>{result.content}</p>
                    )}
                </div>
            </div>,
            postElement as Element,
        );
    });

    return <>{resultElements}</>;
};
export default LockonAIInlineWidget;
