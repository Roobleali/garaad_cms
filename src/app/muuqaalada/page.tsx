'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Upload, Video, Trash2, Play, Pause, X, Search, Filter, Loader2 } from 'lucide-react';

interface UploadedVideo {
    id: number;
    title: string;
    description: string;
    storage_backend: string;
    telegram_file_id: string;
    telegram_message_id: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
    file_size: number;
    width: number;
    height: number;
    format: string;
    created_at: string;
    uploaded_by: number;
}

export default function VideoManagementPage() {
    const [videos, setVideos] = useState<UploadedVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<UploadedVideo | null>(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lms/videos/');
            setVideos(response.data);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Lama soo qaadan karo muuqaalada');
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
        if (!allowedTypes.includes(file.type)) {
            setError('Nooca faylka lama oggola. Isticmaal: MP4, WebM, MOV, AVI, ama MKV');
            return;
        }

        // Validate file size (2GB)
        const maxSize = 2 * 1024 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('Faylka aad u weyn yahay. Cabbirka ugu badan waa 2GB');
            return;
        }

        setSelectedFile(file);
        setError('');
        if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Fadlan dooro fayl muuqaal ah');
            return;
        }

        if (!title.trim()) {
            setError('Fadlan geli cinwaanka muuqaalka');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setUploadProgress(0);

            const formData = new FormData();
            formData.append('video', selectedFile);
            formData.append('title', title);
            formData.append('description', description);

            const response = await api.post('/lms/videos/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                },
            });

            setSuccess('Muuqaalka si guul leh ayaa loo soo geliyay!');
            setShowUploadForm(false);
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            setUploadProgress(0);

            // Refresh video list
            await fetchVideos();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.response?.data?.detail || 'Khalad ayaa dhacay soo gelinta muuqaalka');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (videoId: number) => {
        if (!confirm('Ma hubtaa inaad tirtirto muuqaalkan?')) {
            return;
        }

        try {
            await api.delete(`/lms/videos/${videoId}/`);
            setSuccess('Muuqaalka waa la tirtiray');
            setVideos(videos.filter(v => v.id !== videoId));
            if (selectedVideo?.id === videoId) {
                setSelectedVideo(null);
            }
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Delete error:', err);
            setError('Lama tirtiri karin muuqaalka');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Video className="w-10 h-10" />
                        Maamulka Muuqaalada
                    </h1>
                    <p className="text-purple-200">Soo geli oo maamul muuqaalada koorsooyinka</p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-100">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
                        {error}
                    </div>
                )}

                {/* Action Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Raadi muuqaalada..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                    >
                        <Upload className="w-5 h-5" />
                        Soo Geli Muuqaal
                    </button>
                </div>

                {/* Upload Form Modal */}
                {showUploadForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Soo Geli Muuqaal Cusub</h2>
                                <button
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setSelectedFile(null);
                                        setTitle('');
                                        setDescription('');
                                        setError('');
                                    }}
                                    className="text-purple-300 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-6">
                                {/* File Drop Zone */}
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                                            ? 'border-purple-400 bg-purple-500/20'
                                            : 'border-purple-400/30 bg-white/5'
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                        className="hidden"
                                    />
                                    {selectedFile ? (
                                        <div className="text-purple-100">
                                            <Video className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                                            <p className="font-semibold">{selectedFile.name}</p>
                                            <p className="text-sm text-purple-300 mt-1">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                    ) : (
                                        <div className="text-purple-200">
                                            <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                                            <p className="mb-2">Jiid oo halkan dhig ama</p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                            >
                                                Dooro Fayl
                                            </button>
                                            <p className="text-sm text-purple-300 mt-3">MP4, WebM, MOV, AVI, MKV (Max 2GB)</p>
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-purple-200 mb-2 font-semibold">Cinwaanka *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Geli cinwaanka muuqaalka"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-purple-200 mb-2 font-semibold">Sharaxaad</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        placeholder="Geli sharaxaad ku saabsan muuqaalka (ikhtiyaari)"
                                    />
                                </div>

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-purple-200">
                                            <span>Soo gelinta...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-purple-900/50 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={uploading || !selectedFile}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Soo gelinta...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                Soo Geli
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadForm(false);
                                            setSelectedFile(null);
                                            setTitle('');
                                            setDescription('');
                                            setError('');
                                        }}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                                    >
                                        Jooji
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Video Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="text-center py-20">
                        <Video className="w-20 h-20 mx-auto mb-4 text-purple-400/50" />
                        <p className="text-purple-200 text-lg">
                            {searchQuery ? 'Lama helin muuqaalo' : 'Weli muuqaalo lama soo gelin'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map((video) => (
                            <div
                                key={video.id}
                                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-400/30 hover:border-purple-400 transition-all transform hover:scale-105 cursor-pointer"
                                onClick={() => setSelectedVideo(video)}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Video className="w-16 h-16 text-purple-300/50" />
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                        {formatDuration(video.duration || 0)}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-white font-semibold mb-1 line-clamp-1">{video.title}</h3>
                                    {video.description && (
                                        <p className="text-purple-200 text-sm mb-3 line-clamp-2">{video.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-purple-300">
                                        <span>{formatFileSize(video.file_size || 0)}</span>
                                        <span className="uppercase">{video.format}</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(video.id);
                                            }}
                                            className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Tirtir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Video Preview Modal */}
                {selectedVideo && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{selectedVideo.title}</h2>
                                        {selectedVideo.description && (
                                            <p className="text-purple-200">{selectedVideo.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedVideo(null)}
                                        className="text-purple-300 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Video Player */}
                                <div className="mb-4 rounded-lg overflow-hidden">
                                    <video
                                        src={selectedVideo.video_url}
                                        controls
                                        className="w-full"
                                        autoPlay
                                    >
                                        Browserkaagu ma taageerayo video tag.
                                    </video>
                                </div>

                                {/* Metadata */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <p className="text-purple-300 mb-1">Cabbirka</p>
                                        <p className="text-white font-semibold">{formatFileSize(selectedVideo.file_size || 0)}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <p className="text-purple-300 mb-1">Mudada</p>
                                        <p className="text-white font-semibold">{formatDuration(selectedVideo.duration || 0)}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <p className="text-purple-300 mb-1">Nooca</p>
                                        <p className="text-white font-semibold uppercase">{selectedVideo.format}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <p className="text-purple-300 mb-1">Qaabka</p>
                                        <p className="text-white font-semibold">{selectedVideo.width}x{selectedVideo.height}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
