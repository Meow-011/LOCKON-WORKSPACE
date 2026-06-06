// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Channel Tabs — Notes View (uses Plugin Go Server API)

import React, {useState, useEffect, useRef} from 'react';

interface Props {
    channelId: string;
}

interface NoteData {
    id: string;
    title: string;
    content: string;
    updated_by: string;
    updated_at: number;
}

const PLUGIN_API_BASE = '/plugins/com.lockon.channel-tabs-v3/api/v1';

// Simple Markdown renderer
const renderMarkdown = (text: string): string => {
    if (!text) {
        return '';
    }
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/`([^`]+)`/g, '<code class="notes-inline-code">$1</code>')
        .replace(/^- \[x\] (.+)$/gm, '<div class="notes-checkbox checked"><i class="icon icon-check-circle-outline"></i> $1</div>')
        .replace(/^- \[ \] (.+)$/gm, '<div class="notes-checkbox"><i class="icon icon-checkbox-blank-circle-outline"></i> $1</div>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        .replace(/^> (.+)$/gm, '<blockquote class="notes-quote">$1</blockquote>')
        .replace(/^---$/gm, '<hr class="notes-hr"/>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="notes-link">$1</a>')
        .replace(/\n/g, '<br/>');

    html = html.replace(/((?:<li>.*?<\/li><br\/>?)+)/g, '<ul class="notes-list">$1</ul>');
    html = html.replace(/<ul class="notes-list">([\s\S]*?)<\/ul>/g, (_match, inner) => {
        return '<ul class="notes-list">' + inner.replace(/<br\/>/g, '') + '</ul>';
    });

    return html;
};

const NotesView: React.FC<Props> = ({channelId}) => {
    const [note, setNote] = useState<NoteData>({id: '', title: 'Channel Notes', content: '', updated_by: '', updated_at: 0});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState('');
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!channelId) {
            return;
        }
        setLoading(true);
        fetch(`${PLUGIN_API_BASE}/channels/${channelId}/notes`, {
            headers: {'X-Requested-With': 'XMLHttpRequest'},
        })
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    setNote(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [channelId]);

    const handleContentChange = (content: string) => {
        setNote((prev) => ({...prev, content}));

        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }
        saveTimeout.current = setTimeout(() => {
            saveNote({...note, content});
        }, 1000);
    };

    const saveNote = (noteData: NoteData) => {
        setSaving(true);
        fetch(`${PLUGIN_API_BASE}/channels/${channelId}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(noteData),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    setNote(data);
                }
                setSaving(false);
                setLastSaved(new Date().toLocaleTimeString());
            })
            .catch(() => setSaving(false));
    };

    if (loading) {
        return <div className='tab-loading'>{'Loading notes...'}</div>;
    }

    return (
        <div className='notes-view'>
            <div className='notes-header'>
                <span className='notes-title'>
                    <i
                        className='icon icon-notebook-outline'
                        style={{marginRight: '6px', fontSize: '16px', position: 'relative', top: '3px'}}
                    />
                    {'Channel Notes'}
                </span>
                <div className='notes-toolbar'>
                    <button
                        className={`notes-mode-btn ${mode === 'edit' ? 'active' : ''}`}
                        onClick={() => setMode('edit')}
                        title='Edit'
                    >
                        <i className='icon icon-pencil-outline' style={{marginRight: '4px'}}/>
                        {'Edit'}
                    </button>
                    <button
                        className={`notes-mode-btn ${mode === 'preview' ? 'active' : ''}`}
                        onClick={() => setMode('preview')}
                        title='Preview'
                    >
                        <i className='icon icon-eye-outline' style={{marginRight: '4px'}}/>
                        {'Preview'}
                    </button>
                    <span className='notes-status'>
                        {saving ? (
                            <><i className='icon icon-loading icon--spin'/>{'Saving...'}</>
                        ) : lastSaved ? (
                            <><i className='icon icon-check'/>{lastSaved}</>
                        ) : ''}
                    </span>
                </div>
            </div>

            {mode === 'edit' ? (
                <textarea
                    className='notes-editor'
                    value={note.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder={'Write shared notes using Markdown...\n\n# Heading\n**Bold** *Italic* ~~Strikethrough~~\n- [ ] Todo item\n- [x] Done item\n> Blockquote\n`code`\n[Link](https://...)\n---'}
                />
            ) : (
                <div
                    className='notes-preview'
                    dangerouslySetInnerHTML={{
                        __html: note.content ?
                            renderMarkdown(note.content) :
                            '<div class="notes-preview-empty">Nothing to preview yet. Switch to Edit mode to start writing.</div>',
                    }}
                />
            )}

            <div className='notes-footer'>
                <span className='notes-hint'>
                    {mode === 'edit' ? 'Supports Markdown · Auto-saves after 1s' : 'Viewing rendered Markdown'}
                </span>
            </div>
        </div>
    );
};

export default NotesView;
