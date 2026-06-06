// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Channel Tabs — Files View (uses Mattermost REST API directly)

import React, {useState, useEffect} from 'react';

interface Props {
    channelId: string;
}

interface FileInfo {
    id: string;
    name: string;
    size: number;
    extension: string;
    create_at: number;
    mime_type: string;
}

const FilesView: React.FC<Props> = ({channelId}) => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!channelId) {
            return;
        }
        setLoading(true);
        fetch(`/api/v4/channels/${channelId}/files/info?per_page=50`, {
            headers: {'X-Requested-With': 'XMLHttpRequest'},
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed');
                }
                return res.json();
            })
            .then((data) => {
                setFiles(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setFiles([]);
                setLoading(false);
            });
    }, [channelId]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) {
            return bytes + ' B';
        }
        if (bytes < 1048576) {
            return (bytes / 1024).toFixed(1) + ' KB';
        }
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (ext: string) => {
        const icons: Record<string, string> = {
            pdf: 'icon-file-pdf-outline',
            doc: 'icon-file-word-outline',
            docx: 'icon-file-word-outline',
            xls: 'icon-file-excel-outline',
            xlsx: 'icon-file-excel-outline',
            png: 'icon-file-image-outline',
            jpg: 'icon-file-image-outline',
            jpeg: 'icon-file-image-outline',
            gif: 'icon-file-image-outline',
            svg: 'icon-file-image-outline',
            zip: 'icon-archive-outline',
            rar: 'icon-archive-outline',
            txt: 'icon-file-document-outline',
            md: 'icon-file-document-outline',
            mp4: 'icon-file-video-outline',
            mp3: 'icon-file-music-outline',
            py: 'icon-language-python',
            js: 'icon-language-javascript',
            ts: 'icon-language-typescript',
        };
        const iconClass = icons[ext?.toLowerCase()] || 'icon-file-outline';
        return <i className={`icon ${iconClass}`} style={{fontSize: '24px', color: '#8A6D3B'}}/>;
    };

    if (loading) {
        return <div className='tab-loading'>{'Loading files...'}</div>;
    }

    if (files.length === 0) {
        return (
            <div className='tab-empty'>
                <div className='tab-empty-icon'>
                    <i
                        className='icon icon-folder-outline'
                        style={{fontSize: '48px', color: '#C1A173', display: 'block', marginBottom: '16px'}}
                    />
                </div>
                <div className='tab-empty-title'>{'No files shared'}</div>
                <div className='tab-empty-desc'>
                    {'Files shared in this channel will appear here.'}
                </div>
            </div>
        );
    }

    return (
        <div className='files-list'>
            {files.map((file) => (
                <a
                    key={file.id}
                    className='file-item'
                    href={`/api/v4/files/${file.id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <span className='file-icon'>{getFileIcon(file.extension)}</span>
                    <div className='file-info'>
                        <div className='file-name'>{file.name}</div>
                        <div className='file-meta'>
                            {formatSize(file.size)}{' · '}{new Date(file.create_at).toLocaleDateString()}
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default FilesView;
