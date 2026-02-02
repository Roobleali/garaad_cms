import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { api } from '@/app/api';
import type { ContentBlock, ContentBlockData, Option, DiagramConfig, DiagramObject, ProblemData } from '../types/content';
import { ContentBlockModal } from './ContentBlockModal';
import { Modal } from './ui/Modal';
import { Video, Link, Trash2, Plus, Upload, Loader2, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { DEFAULT_CONTENT, DIAGRAM_EXAMPLE, MULTIPLE_CHOICE_EXAMPLE, TABLE_EXAMPLE, DEFAULT_DIAGRAM_CONFIG, LIST_EXAMPLE } from '@/lib/Block_Examples';
import { RichTextEditor } from './ui/RichTextEditor';

interface ApiErrorResponse {
    detail?: string;
    lesson?: string[];
    [key: string]: unknown;
}

interface ApiError extends Error {
    response?: {
        data: ApiErrorResponse;
        status: number;
        statusText: string;
    };
}

interface LessonContentBlocksProps {
    lessonId: number;
    onUpdate?: () => void;
}

const ProblemContent = ({
    problemId,
    fetchProblemDetails
}: {
    problemId: number;
    fetchProblemDetails: (problemId: number) => Promise<ProblemData>;
}) => {
    const [problemContent, setProblemContent] = useState<ProblemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProblemContent = async () => {
            try {
                setLoading(true);
                const data = await fetchProblemDetails(problemId);
                setProblemContent(data);
            } catch (err) {
                console.error('Error loading problem content:', err);
                const error = err as Error;
                setError(error.message || 'Could not load problem content');
            } finally {
                setLoading(false);
            }
        };

        loadProblemContent();
    }, [problemId, fetchProblemDetails]);

    if (loading) {
        return <div className="text-sm text-gray-500">Loading problem content...</div>;
    }

    if (error) {
        return <div className="text-sm text-red-500">{error}</div>;
    }

    if (!problemContent) {
        return <div className="text-sm text-gray-500">No problem content available</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                    {problemContent.which && (
                        <div className="text-sm text-gray-500 mb-1">{problemContent.which}</div>
                    )}
                    <div className="text-gray-900">{problemContent.question_text}</div>
                    <p className="mt-1 text-sm text-gray-500">Su'aal</p>
                </div>
                {problemContent.img && (
                    <div className="md:w-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                            src={problemContent.img}
                            alt="Question illustration"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                {problemContent.video_url && (
                    <div className="md:w-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                        <video
                            src={`${problemContent.video_url}#t=0.1`}
                            poster={problemContent.thumbnail_url || undefined}
                            preload="metadata"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {problemContent.options && problemContent.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {problemContent.options.map((option: Option) => (
                        <div
                            key={option.id}
                            className={`text-sm p-2 rounded-md ${problemContent.correct_answer?.some((ans: Option) => ans.id === option.id)
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                                }`}
                        >
                            {option.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface TableFeature {
    title: string;
    text: string;
}

interface ProblemOption {
    id: string;
    text: string;
}

export default function LessonContentBlocks({ lessonId, onUpdate }: LessonContentBlocksProps) {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingContent, setEditingContent] = useState<ContentBlockData>(DEFAULT_CONTENT);
    const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [showEditBlock, setShowEditBlock] = useState(false);
    const [showDeleteBlock, setShowDeleteBlock] = useState(false);
    const [deletingBlock, setDeletingBlock] = useState<ContentBlock | null>(null);
    const [adding, setAdding] = useState(false);
    const [editError, setEditError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [videoUploading, setVideoUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [textFieldCount, setTextFieldCount] = useState(1);
    const [tableType, setTableType] = useState<string>('');
    const [tableFeatures, setTableFeatures] = useState<TableFeature[]>([]);

    // Helper to get video duration
    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(Math.round(video.duration));
            };
            video.onerror = () => {
                resolve(0);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setContent: (content: ContentBlockData) => void, content: ContentBlockData) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB (Telegram limit)
        if (file.size > maxSize) {
            setError('Muuqaalka waa inuu ka yaraadaa 2GB');
            return;
        }

        try {
            const duration = await getVideoDuration(file);

            setVideoUploading(true);
            setUploadProgress(0);
            setError('');

            const formData = new FormData();
            formData.append('video', file);
            formData.append('title', content.title || file.name);

            const response = await api.post('lms/videos/', formData, {
                headers: {
                    "Content-Type": undefined,
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                },
            });

            if (content.type === 'video') {
                setContent({
                    ...content,
                    url: response.data.url,
                    source: response.data.url,
                    thumbnail_url: response.data.thumbnail_url,
                    uploaded_video_id: response.data.id,
                    duration: content.duration || duration || response.data.duration,
                    video_source_type: 'upload'
                });
            } else if (content.type === 'problem' || content.type === 'quiz') {
                setContent({
                    ...content,
                    url: response.data.url, // For preview in editor
                    source: response.data.url,
                    video_url: response.data.url,
                    thumbnail_url: response.data.thumbnail_url,
                    uploaded_video_id: response.data.id,
                    duration: content.duration || duration || response.data.duration,
                    video_source_type: 'upload'
                });
            }
        } catch (err) {
            console.error('Video upload error:', err);
            const apiError = err as ApiError;
            setError(apiError.response?.data?.detail || 'Muuqaalka lama soo galin karin');
        } finally {
            setVideoUploading(false);
            setUploadProgress(0);
        }
    };

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                setLoading(true);
                const response = await api.get(`lms/lesson-content-blocks/?lesson=${lessonId}`);
                if (Array.isArray(response.data)) {
                    const sortedBlocks = response.data.sort((a: ContentBlock, b: ContentBlock) => a.order - b.order);
                    setBlocks(sortedBlocks);
                } else {
                    console.error('Invalid response format:', response.data);
                    setError('Invalid response format from server');
                }
            } catch (err) {
                console.error('Error fetching blocks:', err);
                const apiError = err as ApiError;
                setError(apiError.message || 'Qeybaha casharkan lama soo saari karin');
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) {
            fetchBlocks();
        }
    }, [lessonId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddBlock = async (e?: React.FormEvent, closeOnSuccess: boolean = true) => {
        if (e) e.preventDefault();
        setError('');
        let createdProblemId: number | null = null;

        try {
            const specifiedOrder = blocks.length;

            if (editingContent.type === 'problem') {
                // Validate lesson ID
                if (!lessonId) {
                    setError('Casharku wuu khasaaray. Fadlan dib u soo laabo.');
                    return;
                }

                // Validate required fields
                if (!editingContent.question_text) {
                    setError('Su\'aasha waa in la geliyo');
                    return;
                }

                if (!editingContent.question_type) {
                    setError('Nooca su\'aasha waa in la doorto');
                    return;
                }

                // Validate options for multiple choice and single choice
                if (['multiple_choice', 'single_choice'].includes(editingContent.question_type)) {
                    if (!editingContent.options?.length) {
                        setError('Jawaabaha waa in la geliyo');
                        return;
                    }

                    if (!editingContent.correct_answer?.length) {
                        setError('Jawaabta saxda ah waa in la doorto');
                        return;
                    }

                    // For single choice, ensure only one correct answer
                    if (editingContent.question_type === 'single_choice' && editingContent.correct_answer.length > 1) {
                        setError('Hal doorasho waxay yeelan kartaa hal jawaab oo sax ah oo keliya');
                        return;
                    }

                    // Validate that all correct answers exist in options
                    const optionIds = new Set(editingContent.options.map(opt => opt.id));
                    const invalidAnswers = editingContent.correct_answer.filter(ans => !optionIds.has(ans.id));
                    if (invalidAnswers.length > 0) {
                        setError('Jawaabta saxda ahi kuma jirto doorashooyinka');
                        return;
                    }
                }

                // Additional validation for diagram problems
                if (editingContent.question_type === 'diagram') {
                    if (!editingContent.diagram_config) {
                        setError('Diagram configuration waa in la geliyo');
                        return;
                    }

                    // Validate diagram configuration
                    try {
                        validateDiagramConfig(editingContent.diagram_config);
                    } catch (err) {
                        const validationError = err as Error;
                        setError(`Diagram configuration error: ${validationError.message}`);
                        return;
                    }
                }

                // First create the Problem instance
                const problemData: ProblemData = {
                    lesson: lessonId,
                    which: editingContent.which || null,
                    question_text: editingContent.question_text || '',
                    question_type: editingContent.question_type,
                    options: editingContent.options || [],
                    correct_answer: editingContent.correct_answer || [],
                    explanation: editingContent.explanation || '',
                    content: {
                        type: editingContent.question_type,
                        hints: [],
                        steps: [],
                        feedback: {
                            correct: "Waa sax!",
                            incorrect: "Isku day mar kale"
                        },
                        metadata: {
                            tags: [],
                            difficulty: "medium",
                            estimated_time: 5
                        }
                    },
                    xp: editingContent.xp || 10,
                    order: specifiedOrder
                };

                // Only include diagram_config for diagram type problems
                if (editingContent.question_type === 'diagram') {
                    problemData.diagram_config = editingContent.diagram_config || DEFAULT_DIAGRAM_CONFIG;
                }

                // Add img if provided
                if (editingContent.img) {
                    problemData.img = editingContent.img;
                }

                // Add video_url if provided
                if (editingContent.video_url) {
                    problemData.video_url = editingContent.video_url;
                }

                if (editingContent.uploaded_video_id) {
                    problemData.uploaded_video = editingContent.uploaded_video_id;
                }

                try {
                    console.log('Creating problem with data:', JSON.stringify(problemData, null, 2));
                    const problemResponse = await api.post('lms/problems/', problemData);
                    createdProblemId = problemResponse.data.id;
                    console.log('Problem created:', problemResponse.data);

                    if (!problemResponse.data.id) {
                        throw new Error('Problem creation failed - no ID returned');
                    }

                    // Then create the content block referencing the problem
                    const blockData = {
                        block_type: 'problem',  // This is the key change - ensuring block_type is 'problem'
                        content: {},  // Empty object as required for problem blocks
                        order: specifiedOrder,
                        lesson: lessonId,
                        problem: problemResponse.data.id
                    };

                    console.log('Creating content block with data:', JSON.stringify(blockData, null, 2));
                    const response = await api.post('lms/lesson-content-blocks/', blockData);
                    console.log('Content block created:', response.data);

                    if (response.data) {
                        // Update the blocks array with the new block
                        const updatedBlocks = [...blocks];
                        // Insert the new block at the specified order
                        updatedBlocks.splice(specifiedOrder, 0, response.data);
                        // Update order for all blocks
                        updatedBlocks.forEach((b, index) => { b.order = index; });
                        setBlocks(updatedBlocks);
                        if (closeOnSuccess) {
                            setShowAddBlock(false);
                            setEditingContent(DEFAULT_CONTENT);
                        } else {
                            // Reset for new block but keep some helpful defaults if needed
                            setEditingContent({
                                ...DEFAULT_CONTENT,
                                type: editingContent.type, // Keep same type for faster entry
                                order: updatedBlocks.length // Default to end of list
                            });
                        }
                        setTextFieldCount(1);
                        if (onUpdate) onUpdate();

                        // Scroll top for rapid entry
                        if (!closeOnSuccess) {
                            setTimeout(() => {
                                const scrollContainer = document.querySelector('.overflow-y-auto');
                                if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }
                    }
                } catch (error) {
                    // If content block creation fails, clean up the created problem
                    if (createdProblemId) {
                        try {
                            await api.delete(`lms/problems/${createdProblemId}/`);
                        } catch (cleanupError) {
                            console.error('Failed to clean up problem after content block creation failed:', cleanupError);
                        }
                    }
                    throw error; // Re-throw to be caught by outer catch block
                }
            } else if (editingContent.type === 'list') {
                // Ensure list_items is an array and not empty
                const listItems = Array.isArray(editingContent.list_items) ? editingContent.list_items : [];
                if (listItems.length === 0 && !editingContent.title) {
                    setError('Fadlan ku dar waxyaabo liiska ah ama cinwaan');
                    return;
                }

                const blockData = {
                    block_type: 'text',
                    content: {
                        type: 'list',
                        text: JSON.stringify(listItems),
                        title: editingContent.title || '',
                        format: 'markdown'
                    },
                    order: specifiedOrder,
                    lesson: lessonId
                };

                console.log('Sending list block data:', JSON.stringify(blockData, null, 2));

                try {
                    const response = await api.post('lms/lesson-content-blocks/', blockData);
                    console.log('Server response:', response.data);

                    if (response.data) {
                        const updatedBlocks = [...blocks];
                        updatedBlocks.splice(specifiedOrder, 0, response.data);
                        updatedBlocks.forEach((b, index) => { b.order = index; });
                        setBlocks(updatedBlocks);
                        if (closeOnSuccess) {
                            setShowAddBlock(false);
                            setEditingContent(DEFAULT_CONTENT);
                        } else {
                            // Reset for new block but keep some helpful defaults if needed
                            setEditingContent({
                                ...DEFAULT_CONTENT,
                                type: editingContent.type, // Keep same type for faster entry
                                order: updatedBlocks.length // Default to end of list
                            });
                        }
                        setTextFieldCount(1);
                        if (onUpdate) onUpdate();

                        // Scroll top for rapid entry
                        if (!closeOnSuccess) {
                            setTimeout(() => {
                                const scrollContainer = document.querySelector('.overflow-y-auto');
                                if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }
                    }
                } catch (error) {
                    console.error('Error creating list block:', error);
                    if (axios.isAxiosError(error)) {
                        console.error('Error response:', error.response?.data);
                    }
                    throw error;
                }
            } else if (editingContent.type === 'quiz') {
                // Explicitly handle quiz type
                if (!editingContent.url && !editingContent.uploaded_video_id && !editingContent.title) {
                    setError('Fadlan geli URL-ka muuqaalka, soo geli muuqaal, ama geli cinwaan');
                    return;
                }
                const blockData = {
                    block_type: 'quiz',
                    content: {
                        type: 'quiz',
                        text: editingContent.text || '',
                        title: editingContent.title || '',
                        url: editingContent.url || '',
                        video_url: editingContent.video_url || '',
                        uploaded_video_id: editingContent.uploaded_video_id || null,
                        video_source_type: editingContent.video_source_type || 'upload'
                    },
                    order: specifiedOrder,
                    lesson: lessonId
                };

                const response = await api.post('lms/lesson-content-blocks/', blockData);

                if (response.data) {
                    const updatedBlocks = [...blocks];
                    updatedBlocks.splice(specifiedOrder, 0, response.data);
                    updatedBlocks.forEach((b, index) => { b.order = index; });
                    setBlocks(updatedBlocks);
                    if (closeOnSuccess) {
                        setShowAddBlock(false);
                        setEditingContent(DEFAULT_CONTENT);
                    } else {
                        setEditingContent({
                            ...DEFAULT_CONTENT,
                            type: editingContent.type,
                            order: updatedBlocks.length
                        });
                    }
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();

                    // Scroll top for rapid entry
                    if (!closeOnSuccess) {
                        setTimeout(() => {
                            const scrollContainer = document.querySelector('.overflow-y-auto');
                            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }
                }
            } else if (editingContent.type === 'table' || editingContent.type === 'table-grid') {
                // Handle table and table-grid types
                if (editingContent.type === 'table' && (!editingContent.features || editingContent.features.length === 0)) {
                    setError('Fadlan ku dar waxyaabo jadwalka ah');
                    return;
                }
                if (editingContent.type === 'table-grid' && (!editingContent.table?.rows || editingContent.table.rows.length === 0)) {
                    setError('Fadlan ku dar safaf jadwalka ah');
                    return;
                }

                const blockData = {
                    block_type: 'text',
                    content: {
                        type: editingContent.type,
                        text: editingContent.text || '',
                        title: editingContent.title || '',
                        ...(editingContent.type === 'table' && { features: editingContent.features || [] }),
                        ...(editingContent.type === 'table-grid' && {
                            table: {
                                header: editingContent.table?.header || [''],
                                rows: editingContent.table?.rows || []
                            }
                        })
                    },
                    order: specifiedOrder,
                    lesson: lessonId
                };

                const response = await api.post('lms/lesson-content-blocks/', blockData);

                if (response.data) {
                    // Update the blocks array with the new block
                    const updatedBlocks = [...blocks];
                    // Insert the new block at the specified order
                    updatedBlocks.splice(specifiedOrder, 0, response.data);
                    // Update order for all blocks
                    updatedBlocks.forEach((b, index) => { b.order = index; });
                    setBlocks(updatedBlocks);
                    if (closeOnSuccess) {
                        setShowAddBlock(false);
                        setEditingContent(DEFAULT_CONTENT);
                    } else {
                        setEditingContent({
                            ...DEFAULT_CONTENT,
                            type: editingContent.type,
                            order: updatedBlocks.length
                        });
                    }
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();

                    // Scroll top for rapid entry
                    if (!closeOnSuccess) {
                        setTimeout(() => {
                            const scrollContainer = document.querySelector('.overflow-y-auto');
                            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }
                }
            } else if (editingContent.type === 'video') {
                // Handle video type
                if (!editingContent.url && !editingContent.uploaded_video_id) {
                    setError('Fadlan geli URL-ka muuqaalka ama soo geli muuqaal');
                    return;
                }
                const blockData = {
                    block_type: 'video',
                    content: {
                        source: editingContent.url || '',
                        url: editingContent.url || '',
                        title: editingContent.title || '',
                        description: editingContent.description || '',
                        duration: editingContent.duration || null,
                        video_source_type: editingContent.video_source_type || 'upload'
                    },
                    order: specifiedOrder,
                    lesson: lessonId
                };

                const response = await api.post('lms/lesson-content-blocks/', blockData);

                if (response.data) {
                    // Update the blocks array with the new block
                    const updatedBlocks = [...blocks];
                    // Insert the new block at the specified order
                    updatedBlocks.splice(specifiedOrder, 0, response.data);
                    // Update order for all blocks
                    updatedBlocks.forEach((b, index) => { b.order = index; });
                    setBlocks(updatedBlocks);
                    if (closeOnSuccess) {
                        setShowAddBlock(false);
                        setEditingContent(DEFAULT_CONTENT);
                    } else {
                        setEditingContent({
                            ...DEFAULT_CONTENT,
                            type: editingContent.type,
                            order: updatedBlocks.length
                        });
                    }
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();

                    // Scroll top for rapid entry
                    if (!closeOnSuccess) {
                        setTimeout(() => {
                            const scrollContainer = document.querySelector('.overflow-y-auto');
                            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }
                }
            } else {
                // Handle normal text type
                const mainText = editingContent.text || '';
                const text1 = editingContent.text1 || '';
                const text2 = editingContent.text2 || '';
                const text3 = editingContent.text3 || '';
                const text4 = editingContent.text4 || '';
                const text5 = editingContent.text5 || '';
                const title = editingContent.title || '';

                if (!mainText && !text1 && !text2 && !text3 && !text4 && !text5 && !title) {
                    setError('Fadlan geli qoraal ama cinwaan');
                    return;
                }

                const blockData = {
                    block_type: 'text',
                    content: {
                        text: mainText,
                        type: 'qoraal',
                        format: 'latex',
                        order: specifiedOrder,
                        text1: text1,
                        text2: text2,
                        text3: text3,
                        text4: text4,
                        text5: text5,
                        title: title,
                        url: editingContent.url || '',
                        url1: editingContent.url1 || '',
                        url2: editingContent.url2 || '',
                        url3: editingContent.url3 || '',
                        url4: editingContent.url4 || '',
                        url5: editingContent.url5 || '',
                        content: {
                            type: 'text',
                            hints: [],
                            steps: [],
                            feedback: {
                                correct: "Waa sax!",
                                incorrect: "Isku day mar kale"
                            },
                            metadata: {
                                tags: [],
                                difficulty: "medium",
                                estimated_time: 5
                            }
                        }
                    },
                    order: specifiedOrder,
                    lesson: lessonId
                };

                const response = await api.post('lms/lesson-content-blocks/', blockData);

                if (response.data) {
                    // Update the blocks array with the new block
                    const updatedBlocks = [...blocks];
                    // Insert the new block at the specified order
                    updatedBlocks.splice(specifiedOrder, 0, response.data);
                    // Update order for all blocks
                    updatedBlocks.forEach((b, index) => { b.order = index; });
                    setBlocks(updatedBlocks);
                    if (closeOnSuccess) {
                        setShowAddBlock(false);
                        setEditingContent(DEFAULT_CONTENT);
                    } else {
                        setEditingContent({
                            ...DEFAULT_CONTENT,
                            type: editingContent.type,
                            order: updatedBlocks.length
                        });
                    }
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();

                    // Scroll top for rapid entry
                    if (!closeOnSuccess) {
                        setTimeout(() => {
                            const scrollContainer = document.querySelector('.overflow-y-auto');
                            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }
                }
            }
        } catch (error) {
            console.error('Error in handleAddBlock:', error);
            if (axios.isAxiosError(error)) {
                const apiError = error as ApiError;
                setError(apiError.response?.data?.detail || apiError.message || 'Qeybaha dib uma habeyn karin');
            } else {
                setError('Qeybaha dib uma habeyn karin');
            }
        }
    };

    // Update the table type selection handler
    const handleTableTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTableType = e.target.value;
        setTableType(newTableType);

        if (newTableType === 'table') {
            setEditingContent(TABLE_EXAMPLE);
            setTableFeatures(TABLE_EXAMPLE.features || []);
        } else {
            setEditingContent({
                ...editingContent,
                type: 'qoraal',
                content: {
                    type: 'text',
                    hints: [],
                    steps: [],
                    feedback: {
                        correct: "Waa sax!",
                        incorrect: "Isku day mar kale"
                    },
                    metadata: {
                        tags: [],
                        difficulty: "medium",
                        estimated_time: 5
                    }
                }
            });
        }
    };

    // Helper function to validate diagram configuration
    const validateDiagramConfig = (config: DiagramConfig) => {
        if (!config.diagram_id) {
            throw new Error('Diagram ID is required');
        }

        if (!config.diagram_type) {
            throw new Error('Diagram type is required');
        }

        if (typeof config.scale_weight !== 'number') {
            throw new Error('Scale weight must be a number');
        }

        if (!Array.isArray(config.objects)) {
            throw new Error('Objects must be an array');
        }

        // Validate each object
        config.objects.forEach((obj, index) => {
            if (!obj.type) {
                throw new Error(`Object ${index + 1} must have a type`);
            }
            if (!obj.color) {
                throw new Error(`Object ${index + 1} must have a color`);
            }
            if (typeof obj.number !== 'number') {
                throw new Error(`Object ${index + 1} must have a valid number`);
            }
            if (!obj.position) {
                throw new Error(`Object ${index + 1} must have a position`);
            }
            if (!obj.layout) {
                throw new Error(`Object ${index + 1} must have a layout configuration`);
            }
            if (typeof obj.layout.rows !== 'number' || obj.layout.rows < 1) {
                throw new Error(`Object ${index + 1} must have a valid number of rows (>= 1)`);
            }
            if (typeof obj.layout.columns !== 'number' || obj.layout.columns < 1) {
                throw new Error(`Object ${index + 1} must have a valid number of columns (>= 1)`);
            }
            if (!['top', 'bottom', 'left', 'right', 'center'].includes(obj.layout.position)) {
                throw new Error(`Object ${index + 1} must have a valid layout position (top, bottom, left, right, or center)`);
            }
            if (!['left', 'center', 'right'].includes(obj.layout.alignment)) {
                throw new Error(`Object ${index + 1} must have a valid layout alignment (left, center, or right)`);
            }
        });
    };

    // Update block
    const handleUpdateBlock = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!editingContent || !editingBlock) return;

        try {
            if (editingContent.type === 'problem') {
                // Validate required fields
                if (!editingContent.question_text) {
                    setEditError('Su\'aasha waa in la geliyo');
                    return;
                }

                if (!editingContent.question_type) {
                    setEditError('Nooca su\'aasha waa in la doorto');
                    return;
                }

                if (!editingContent.explanation) {
                    setEditError('Sharaxaada waa in la geliyo');
                    return;
                }

                // Validate options for multiple choice and single choice
                if (['multiple_choice', 'single_choice'].includes(editingContent.question_type)) {
                    if (!editingContent.options?.length) {
                        setEditError('Jawaabaha waa in la geliyo');
                        return;
                    }

                    if (!editingContent.correct_answer?.length) {
                        setEditError('Jawaabta saxda ah waa in la doorto');
                        return;
                    }

                    // For single choice, ensure only one correct answer
                    if (editingContent.question_type === 'single_choice' && editingContent.correct_answer.length > 1) {
                        setEditError('Hal doorasho waxay yeelan kartaa hal jawaab oo sax ah oo keliya');
                        return;
                    }

                    // Validate that all correct answers exist in options
                    const optionIds = new Set(editingContent.options.map(opt => opt.id));
                    const invalidAnswers = editingContent.correct_answer.filter(ans => !optionIds.has(ans.id));
                    if (invalidAnswers.length > 0) {
                        setEditError('Jawaabta saxda ahi kuma jirto doorashooyinka');
                        return;
                    }
                }

                // Additional validation for diagram problems
                if (editingContent.question_type === 'diagram') {
                    if (!editingContent.diagram_config) {
                        setEditError('Diagram configuration waa in la geliyo');
                        return;
                    }

                    // Validate diagram configuration
                    try {
                        validateDiagramConfig(editingContent.diagram_config);
                    } catch (err) {
                        const validationError = err as Error;
                        setEditError(`Diagram configuration error: ${validationError.message}`);
                        return;
                    }
                }

                // First update the Problem instance
                const problemData: ProblemData = {
                    lesson: lessonId,
                    which: editingContent.which || null,
                    question_text: editingContent.question_text || '',
                    question_type: editingContent.question_type,
                    options: editingContent.options || [],
                    correct_answer: editingContent.correct_answer || [],
                    explanation: editingContent.explanation || '',
                    content: {
                        type: editingContent.question_type,
                        hints: [],
                        steps: [],
                        feedback: {
                            correct: "Waa sax!",
                            incorrect: "Isku day mar kale"
                        },
                        metadata: {
                            tags: [],
                            difficulty: "medium",
                            estimated_time: 5
                        }
                    },
                    xp: editingContent.xp || 10,
                    order: editingContent.order || editingBlock.order
                };

                // Only include diagram_config for diagram type problems
                if (editingContent.question_type === 'diagram') {
                    problemData.diagram_config = editingContent.diagram_config || DEFAULT_DIAGRAM_CONFIG;
                }

                // Add img if provided
                if (editingContent.img) {
                    problemData.img = editingContent.img;
                }

                // Add video_url if provided
                if (editingContent.video_url) {
                    problemData.video_url = editingContent.video_url;
                }

                if (editingContent.uploaded_video_id) {
                    problemData.uploaded_video = editingContent.uploaded_video_id;
                }

                try {
                    console.log('Updating problem with data:', JSON.stringify(problemData, null, 2));
                    await api.put(`lms/problems/${editingBlock.problem}/`, problemData);
                    console.log('Problem updated successfully');

                    // Then update the content block
                    const blockData = {
                        block_type: 'problem',  // Ensure block_type is 'problem'
                        content: {},  // Empty object as required for problem blocks
                        order: editingContent.order || editingBlock.order,
                        lesson: lessonId,
                        problem: editingBlock.problem  // Keep the same problem ID
                    };

                    console.log('Updating content block with data:', JSON.stringify(blockData, null, 2));
                    const response = await api.put(`lms/lesson-content-blocks/${editingBlock.id}/`, blockData);
                    console.log('Content block updated:', response.data);

                    if (response.data) {
                        setBlocks(prevBlocks =>
                            prevBlocks.map(b => b.id === editingBlock.id ? response.data : b)
                        );
                        setEditingBlock(null);
                        setEditingContent(DEFAULT_CONTENT);
                        setShowEditBlock(false);
                        setTextFieldCount(1);
                        if (onUpdate) onUpdate();
                    }
                } catch (error) {
                    console.error('Error updating problem or content block:', error);
                    throw error;
                }
            } else if (editingContent.type === 'list') {
                // Ensure list_items is an array and not empty
                const listItems = Array.isArray(editingContent.list_items) ? editingContent.list_items : [];
                if (listItems.length === 0 && !editingContent.title) {
                    setEditError('Fadlan ku dar waxyaabo liiska ah ama cinwaan');
                    return;
                }

                const blockData = {
                    block_type: 'text',
                    content: {
                        type: 'list',
                        text: JSON.stringify(listItems),
                        title: editingContent.title || '',
                        format: 'markdown'
                    },
                    order: editingBlock.order,
                    lesson: lessonId
                };

                console.log('Updating list block data:', JSON.stringify(blockData, null, 2));

                try {
                    const response = await api.put(`lms/lesson-content-blocks/${editingBlock.id}/`, blockData);
                    console.log('Server response:', response.data);

                    if (response.data) {
                        const updatedBlocks = blocks.map(block =>
                            block.id === editingBlock.id ? response.data : block
                        );
                        setBlocks(updatedBlocks);
                        setEditingContent(DEFAULT_CONTENT);
                        setEditingBlock(null);
                        if (onUpdate) onUpdate();
                    }
                } catch (error) {
                    console.error('Error updating list block:', error);
                    if (axios.isAxiosError(error)) {
                        console.error('Error response:', error.response?.data);
                    }
                    throw error;
                }
            } else if (editingContent.type === 'quiz') {
                // Explicitly handle quiz update
                if (!editingContent.url && !editingContent.uploaded_video_id && !editingContent.title) {
                    setEditError('Fadlan geli URL-ka muuqaalka, soo geli muuqaal, ama geli cinwaan');
                    return;
                }
                const blockData = {
                    ...editingBlock,
                    block_type: 'quiz',
                    content: {
                        type: 'quiz',
                        text: editingContent.text || '',
                        title: editingContent.title || '',
                        url: editingContent.url || '',
                        video_url: editingContent.video_url || '',
                        uploaded_video_id: editingContent.uploaded_video_id || null,
                        video_source_type: editingContent.video_source_type || 'upload'
                    },
                    order: editingContent.order || editingBlock.order,
                    lesson: lessonId
                };

                const response = await api.put(`lms/lesson-content-blocks/${editingBlock.id}/`, blockData);

                if (response.data) {
                    setBlocks(prevBlocks =>
                        prevBlocks.map(b => b.id === editingBlock.id ? response.data : b)
                    );
                    setEditingBlock(null);
                    setEditingContent(DEFAULT_CONTENT);
                    setShowEditBlock(false);
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();
                }
            } else if (editingContent.type === 'table' || editingContent.type === 'table-grid') {
                // Handle table type
                if (editingContent.type === 'table' && (!editingContent.features || editingContent.features.length === 0)) {
                    setEditError('Fadlan ku dar waxyaabo jadwalka ah');
                    return;
                }
                if (editingContent.type === 'table-grid' && (!editingContent.table?.rows || editingContent.table.rows.length === 0)) {
                    setEditError('Fadlan ku dar safaf jadwalka ah');
                    return;
                }
                const blockData = {
                    ...editingBlock,
                    block_type: 'text',
                    content: {
                        type: editingContent.type,
                        text: editingContent.text || '',
                        title: editingContent.title || '',
                        ...(editingContent.type === 'table' && { features: editingContent.features || [] }),
                        ...(editingContent.type === 'table-grid' && {
                            table: {
                                header: editingContent.table?.header || [''],
                                rows: editingContent.table?.rows || []
                            }
                        })
                    },
                    order: editingContent.order || editingBlock.order,
                    lesson: lessonId
                };

                const response = await api.put(`lms/lesson-content-blocks/${editingBlock.id}/`, blockData);

                if (response.data) {
                    setBlocks(prevBlocks =>
                        prevBlocks.map(b => b.id === editingBlock.id ? response.data : b)
                    );
                    setEditingBlock(null);
                    setEditingContent(DEFAULT_CONTENT);
                    setShowEditBlock(false);
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();
                }
            } else if (editingContent.type === 'video') {
                // Handle video type
                if (!editingContent.url && !editingContent.uploaded_video_id) {
                    setEditError('Fadlan geli URL-ka muuqaalka ama soo geli muuqaal');
                    return;
                }
                const blockData = {
                    ...editingBlock,
                    block_type: 'video',
                    content: {
                        source: editingContent.url || '',
                        url: editingContent.url || '',
                        title: editingContent.title || '',
                        description: editingContent.description || '',
                        duration: editingContent.duration || null,
                        video_source_type: editingContent.video_source_type || 'upload'
                    },
                    order: editingContent.order || editingBlock.order,
                    lesson: lessonId
                };

                const response = await api.put(`lms/lesson-content-blocks/${editingBlock.id}/`, blockData);

                if (response.data) {
                    setBlocks(prevBlocks =>
                        prevBlocks.map(b => b.id === editingBlock.id ? response.data : b)
                    );
                    setEditingBlock(null);
                    setEditingContent(DEFAULT_CONTENT);
                    setShowEditBlock(false);
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();
                }
            } else {
                // Handle normal text type
                const mainText = editingContent.text || '';
                const text1 = editingContent.text1 || '';
                const text2 = editingContent.text2 || '';
                const text3 = editingContent.text3 || '';
                const text4 = editingContent.text4 || '';
                const text5 = editingContent.text5 || '';
                const title = editingContent.title || '';

                if (!mainText && !text1 && !text2 && !text3 && !text4 && !text5 && !title) {
                    setEditError('Fadlan geli qoraal ama cinwaan');
                    return;
                }

                const blockData = {
                    ...editingBlock,
                    block_type: 'text',
                    content: {
                        text: mainText,
                        type: 'qoraal',
                        format: 'latex',
                        order: editingContent.order || editingBlock.order,
                        text1: text1,
                        text2: text2,
                        text3: text3,
                        text4: text4,
                        text5: text5,
                        title: title,
                        url: editingContent.url || '',  // Add URL to the content
                        url1: editingContent.url1 || '',
                        url2: editingContent.url2 || '',
                        url3: editingContent.url3 || '',
                        url4: editingContent.url4 || '',
                        url5: editingContent.url5 || '',
                        content: {
                            type: 'text',
                            hints: [],
                            steps: [],
                            feedback: {
                                correct: "Waa sax!",
                                incorrect: "Isku day mar kale"
                            },
                            metadata: {
                                tags: [],
                                difficulty: "medium",
                                estimated_time: 5
                            }
                        }
                    },
                    order: editingContent.order || editingBlock.order,
                    lesson: lessonId
                };

                const response = await api.put(`lms/lesson-content-blocks/${editingBlock.id}/`, blockData);

                if (response.data) {
                    setBlocks(prevBlocks =>
                        prevBlocks.map(b => b.id === editingBlock.id ? response.data : b)
                    );
                    setEditingBlock(null);
                    setEditingContent(DEFAULT_CONTENT);
                    setShowEditBlock(false);
                    setTextFieldCount(1);
                    if (onUpdate) onUpdate();
                }
            }
        } catch (error) {
            console.error('Error in handleUpdateBlock:', error);
            if (axios.isAxiosError(error)) {
                const apiError = error as ApiError;
                setError(apiError.response?.data?.detail || apiError.message || 'Qeybaha dib uma habeyn karin');
            } else {
                setError('Qeybaha dib uma habeyn karin');
            }
        }
    };

    // Delete block
    const handleDeleteBlock = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!deletingBlock) return;

        try {
            setDeleteError('');

            // First delete the content block
            await api.delete(`lms/lesson-content-blocks/${deletingBlock.id}/`);

            // Then delete the problem if it exists
            // This order is important because LessonContentBlock has SET_NULL on problem field
            if (deletingBlock.block_type === 'problem' && deletingBlock.problem) {
                try {
                    await api.delete(`lms/problems/${deletingBlock.problem}/`);
                } catch (problemDeleteError) {
                    console.error('Error deleting problem:', problemDeleteError);
                    // Don't throw here - the content block is already deleted
                    // Just log the error since the problem might be referenced elsewhere
                }
            }

            setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== deletingBlock.id));
            setDeletingBlock(null);
            setShowDeleteBlock(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Error deleting block:', err);
            const apiError = err as ApiError;
            if (apiError.response) {
                const errorDetail = apiError.response.data?.detail || apiError.response.data?.lesson?.[0] || apiError.message;
                setDeleteError(errorDetail || 'Qeybta lama tiri karin');
            } else {
                setDeleteError(apiError.message || 'Qeybta lama tiri karin');
            }
        }
    };

    // Reorder blocks
    const handleReorder = async (blockId: number, newOrder: number) => {
        if (newOrder < 0 || newOrder >= blocks.length) return;

        try {
            setError('');
            const updatedBlocks = [...blocks];
            const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
            const block = updatedBlocks[blockIndex];

            // Remove the block from its current position
            updatedBlocks.splice(blockIndex, 1);
            // Insert it at the new position
            updatedBlocks.splice(newOrder, 0, block);

            // Update order for all blocks
            const reorderedBlocks = updatedBlocks.map((b, index) => ({
                ...b,
                order: index
            }));

            // Update the blocks in state first (optimistic UI)
            setBlocks(reorderedBlocks);

            // Prepare the block order array (IDs in the new order)
            const blockOrder = reorderedBlocks.map(b => b.id);

            // FIXED: Use collection-level endpoint with correct payload format
            await api.post(`lms/lesson-content-blocks/reorder/`, {
                lesson_id: lessonId,
                block_order: blockOrder
            });

            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Error reordering blocks:', err);
            const apiError = err as ApiError;
            setError(apiError.message || 'Qeybaha dib uma habeyn karin');

            // Revert the changes if the server update fails
            const response = await api.get(`lms/lesson-content-blocks/?lesson=${lessonId}`);
            if (Array.isArray(response.data)) {
                const sortedBlocks = response.data.sort((a: ContentBlock, b: ContentBlock) => a.order - b.order);
                setBlocks(sortedBlocks);
            }
        }
    };

    // Update the renderBlockContent function to handle the stringified list format
    const renderBlockContent = (block: ContentBlock) => {
        if (block.block_type === 'problem' && block.problem) {
            return <ProblemContent problemId={block.problem} fetchProblemDetails={fetchProblemDetails} />;
        }

        // For non-problem blocks
        const content = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
        return (
            <div className="space-y-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                        {content.type === 'list' ? 'Liiska' :
                            content.type === 'table' ? 'Jadwal' :
                                content.type === 'table-grid' ? 'Jadwal Grid' :
                                    (content.type === 'video' || block.block_type === 'video') ? 'Muuqaal' :
                                        (content.type === 'quiz' || block.block_type === 'quiz') ? 'Quiz' :
                                            'Qoraal'}
                    </p>
                </div>
                {content.type === 'list' && content.text && (
                    <ul className="list-disc pl-5 space-y-2">
                        {JSON.parse(content.text).map((item: string, index: number) => (
                            <li key={index} className="text-gray-700">{item}</li>
                        ))}
                    </ul>
                )}
                {content.type !== 'list' && content.text && <div className="text-gray-700">{content.text}</div>}
                {(content.url || content.video_url) && (
                    content.type === 'video' || block.block_type === 'video' || content.type === 'quiz' || block.block_type === 'quiz' ? (
                        <div className="max-w-md aspect-video rounded-lg overflow-hidden bg-black">
                            <video
                                src={`${content.url || content.video_url}#t=0.1`}
                                poster={content.thumbnail_url || undefined}
                                controls
                                preload="metadata"
                                className="w-full h-full"
                            />
                        </div>
                    ) : content.url ? (
                        <img
                            src={content.url}
                            alt={content.title}
                            className="w-full max-w-md h-auto rounded-lg"
                        />
                    ) : null
                )}
                {content.url && (
                    <p className="text-xs text-gray-500 font-mono break-all bg-gray-50 p-2 rounded border border-gray-100 max-w-md">
                        {content.url}
                    </p>
                )}
                {content.text1 && <div className="text-gray-700">{content.text1}</div>}
                {content.text2 && <div className="text-gray-700">{content.text2}</div>}
                {content.text3 && <div className="text-gray-700">{content.text3}</div>}
                {content.text4 && <div className="text-gray-700">{content.text4}</div>}
                {content.text5 && <div className="text-gray-700">{content.text5}</div>}
            </div>
        );
    };

    const renderContentForm = (content: ContentBlockData, setContent: (content: ContentBlockData) => void) => {
        return (
            <div className="space-y-3">
                {/* Type and Order Group */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                        <h4 className="text-base font-semibold text-gray-900">
                            Nooca & Kala Horeeynta
                        </h4>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nooca Qeybta</label>
                            <select
                                value={content.type}
                                onChange={(e) => {
                                    const newType = e.target.value as ContentBlockData['type'];
                                    if (newType === 'problem') {
                                        setContent({
                                            type: 'problem',
                                            question_type: 'multiple_choice',
                                            which: null,
                                            question_text: '',
                                            options: [],
                                            correct_answer: [],
                                            explanation: '',
                                            content: {
                                                type: 'multiple_choice',
                                                hints: [],
                                                steps: [],
                                                feedback: {
                                                    correct: "Waa sax!",
                                                    incorrect: "Isku day mar kale",
                                                },
                                                metadata: {
                                                    tags: [],
                                                    difficulty: "medium",
                                                    estimated_time: 5,
                                                },
                                            },
                                            xp: 10,
                                            order: content.order
                                        });
                                    } else if (newType === 'list') {
                                        setContent({ ...LIST_EXAMPLE });
                                    } else {
                                        setContent({ ...DEFAULT_CONTENT, type: newType });
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                            >
                                <option value="qoraal">Qoraal</option>
                                <option value="table">Jawdwal</option>
                                <option value="table-grid">Jadwal Grid</option>
                                <option value="problem">Su'aal</option>
                                <option value="video">Muuqaal</option>
                                <option value="quiz">Quiz</option>
                                <option value="list">Liiska</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="content-order" className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Kala Horeeynta</label>
                            <input
                                type="number"
                                id="content-order"
                                value={content.order === 0 ? '0' : (content.order || '')}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                    setContent({ ...content, order: value });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Type Selector */}
                {(content.type === 'table' || content.type === 'table-grid') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <h4 className="text-base font-semibold text-gray-900">
                                Nooca Jadwalka
                            </h4>
                        </div>
                        <div className="px-6 py-2">
                            <select
                                id="tableType"
                                value={tableType}
                                onChange={(e) => {
                                    handleTableTypeChange(e);
                                    if (e.target.value) {
                                        setContent({ ...content, type: e.target.value as any });
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                            >
                                <option value="">Select table type</option>
                                <option value="table">Table</option>
                                <option value="table-grid">Table Grid</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* List content form */}
                {content.type === 'list' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <h4 className="text-base font-semibold text-gray-900">
                                Faahfaahinta Liiska
                            </h4>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label htmlFor="listTitle" className="block text-sm font-medium text-gray-700 mb-2">
                                    Cinwaanka
                                </label>
                                <input
                                    type="text"
                                    id="listTitle"
                                    value={content.title || ''}
                                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                                    placeholder="Geli cinwaanka liiska..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Waxyaabaha Liiska (Items)
                                </label>
                                <div className="space-y-3">
                                    {(content.list_items || []).map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => {
                                                    const newItems = [...(content.list_items || [])];
                                                    newItems[index] = e.target.value;
                                                    setContent({ ...content, list_items: newItems });
                                                }}
                                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                                                placeholder={`Shayga ${index + 1}...`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = [...(content.list_items || [])];
                                                    newItems.splice(index, 1);
                                                    setContent({ ...content, list_items: newItems });
                                                }}
                                                className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setContent({
                                                ...content,
                                                list_items: [...(content.list_items || []), '']
                                            });
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 border-dashed rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-all duration-200"
                                    >
                                        + Ku dar shay cusub
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table content form */}
                {tableType === 'table' && (
                    <div className="space-y-2">
                        <div className="mb-4">
                            <label htmlFor="tableText" className="block text-sm font-medium text-gray-700 mb-2">
                                Qoraalka Guud
                            </label>
                            <RichTextEditor
                                content={content.text || ''}
                                onChange={(newVal) => setContent({ ...content, text: newVal })}
                                placeholder="Geli qoraalka guud..."
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h4 className="text-base font-semibold text-gray-900">
                                    Astaamaha
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newFeatures = [...(content.features || []), { title: '', text: '' }];
                                        setContent({ ...content, features: newFeatures });
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ku dar Astaame
                                </button>
                            </div>

                            {(content.features || []).map((feature, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h5 className="text-sm font-medium text-gray-700">Astaame {index + 1}</h5>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newFeatures = content.features?.filter((_, i) => i !== index);
                                                setContent({ ...content, features: newFeatures });
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <label htmlFor={`feature-title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                Magac
                                            </label>
                                            <input
                                                type="text"
                                                id={`feature-title-${index}`}
                                                value={feature.title}
                                                onChange={(e) => {
                                                    const newFeatures = [...(content.features || [])];
                                                    newFeatures[index] = { ...feature, title: e.target.value };
                                                    setContent({ ...content, features: newFeatures });
                                                }}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor={`feature-text-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                Qoraal
                                            </label>
                                            <RichTextEditor
                                                content={feature.text || ''}
                                                onChange={(newVal) => {
                                                    const newFeatures = [...(content.features || [])];
                                                    newFeatures[index] = { ...feature, text: newVal };
                                                    setContent({ ...content, features: newFeatures });
                                                }}
                                                placeholder="Geli qoraalka..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {content.type === 'table-grid' && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-base font-semibold text-gray-900">
                                Qoraalka Guud
                            </h4>
                            <button
                                type="button"
                                onClick={() => {
                                    setContent({
                                        ...content,
                                        type: 'table-grid',
                                        text: 'Tixgeli tusaale ahaan halka (m = 569) (s = 1187) iyo (n = 447) Haddii aan adeeg­sanno mod tallaabo kasta ama aan adeegsanno mod oo keliya ka dib marka aan isku dhufanno farriinta iyo furaha qarsoon waxaan heli doonnaa natiijo isku mid ah',
                                        table: {
                                            header: ['Tallaabo kasta mod', 'Mod dhammaadka kaliya'],
                                            rows: [
                                                ['569 mod 447 = 122', '569 × 1187 = 675 403'],
                                                ['1187 mod 447 = 293', '675 403 mod 447 = 433'],
                                                ['122 × 293 = 35 746', ''],
                                                ['35 746 mod 447 = 433', ''],
                                                ['122 = 293 × 433 mod 447 = 122', '']
                                            ]
                                        }
                                    });
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tusaale Jadwal ah
                            </button>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="tableGridText" className="block text-sm font-medium text-gray-700 mb-2">
                                Qoraalka Guud
                            </label>
                            <RichTextEditor
                                content={content.text || ''}
                                onChange={(newVal) => setContent({ ...content, text: newVal })}
                                placeholder="Tixgeli tusaale ahaan halka (m = 569) (s = 1187) iyo (n = 447)..."
                            />
                        </div>

                        {/* Header editing */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ciwaanada Jadwalka (Header)</label>
                            <div className="flex gap-2 flex-wrap">
                                {(content.table?.header && content.table.header.length > 0 ? content.table.header : ['']).map((headerCell, headerIdx) => (
                                    <input
                                        key={headerIdx}
                                        type="text"
                                        value={headerCell}
                                        onChange={e => {
                                            const newHeader = [...(content.table?.header || [''])];
                                            newHeader[headerIdx] = e.target.value;
                                            setContent({
                                                ...content,
                                                table: {
                                                    header: newHeader,
                                                    rows: content.table?.rows || []
                                                }
                                            });
                                        }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                                        placeholder={`Ciwaan ${headerIdx + 1}`}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const header = content.table?.header && content.table.header.length > 0 ? content.table.header : [''];
                                        setContent({
                                            ...content,
                                            table: {
                                                header: [...header, ''],
                                                rows: (content.table?.rows || []).map(row => [...row, ''])
                                            }
                                        });
                                    }}
                                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                                >
                                    + Ciwaan
                                </button>
                                {content.table?.header && content.table.header.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!content.table) return;
                                            setContent({
                                                ...content,
                                                table: {
                                                    header: content.table.header.slice(0, -1),
                                                    rows: (content.table.rows || []).map(row => row.slice(0, -1))
                                                }
                                            });
                                        }}
                                        className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                                    >
                                        -
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Rows editing */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h4 className="text-base font-semibold text-gray-900">
                                    Safafka Jadwalka
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const colCount = (content.table?.header && content.table.header.length > 0) ? content.table.header.length : 1;
                                        const newRow = Array(colCount).fill('');
                                        setContent({
                                            ...content,
                                            table: {
                                                header: content.table?.header && content.table.header.length > 0 ? content.table.header : [''],
                                                rows: [...(content.table?.rows || []), newRow]
                                            }
                                        });
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ku dar Saf
                                </button>
                            </div>

                            {(content.table?.rows || []).map((row, rowIndex) => (
                                <div key={rowIndex} className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h5 className="text-sm font-medium text-gray-700">Saf {rowIndex + 1}</h5>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newRows = content.table?.rows.filter((_, i) => i !== rowIndex) || [];
                                                setContent({
                                                    ...content,
                                                    table: {
                                                        header: content.table?.header && content.table.header.length > 0 ? content.table.header : [''],
                                                        rows: newRows
                                                    }
                                                });
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className={`grid grid-cols-${content.table?.header && content.table.header.length > 0 ? content.table.header.length : 1} gap-2`}>
                                        {(content.table?.header && content.table.header.length > 0 ? content.table.header : ['']).map((_, colIdx) => (
                                            <input
                                                key={colIdx}
                                                type="text"
                                                value={row[colIdx] || ''}
                                                onChange={e => {
                                                    const newRows = [...(content.table?.rows || [])];
                                                    newRows[rowIndex][colIdx] = e.target.value;
                                                    setContent({
                                                        ...content,
                                                        table: {
                                                            header: content.table?.header && content.table.header.length > 0 ? content.table.header : [''],
                                                            rows: newRows
                                                        }
                                                    });
                                                }}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                                                placeholder={`Cell ${rowIndex + 1},${colIdx + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {content.type === 'qoraal' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <h4 className="text-base font-semibold text-gray-900">
                                    Faahfaahinta Qoraalka
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setContent({
                                        ...content,
                                        type: 'qoraal',
                                        title: 'Lacagta Dhijitaalka ah',
                                        text: 'Si loo fahmo lacagta dhijitaalka ah iyo runta ka dambeysa sheegashooyinkan, waxay gacan ka geysaneysaa in la fahmo aasaaska lacagta guud ahaan. Aan bilowno.\n\nLacagaha dhijitaalka ah waa hab cusub oo lagu kala beddelan karo badeecadaha iyo adeegyada.\n\nWaxay ku shaqeeyaan \'blockchains\' - qaab dhismeed xogeed oo si sir ah loo ilaaliyo. Taageerayaashoodu waxay ku doodayaan inay hoos u dhigi doonaan khidmadaha wax kala iibsiga isla markaana dimuqraadiyeyn doonaan siyaasadda lacagta, halka kuwa dhaleeceeya ay sheegayaan inay yihiin riyooyin xisaabyahanno oo dib loogu soo celiyay khiyaano.',
                                        url: ''
                                    })}
                                    className="px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-all duration-200"
                                >
                                    + Tusaale Qoraal ah
                                </button>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="content-title"
                                        className="block text-sm font-medium mb-2 text-gray-900"
                                    >
                                        Cinwaanka
                                    </label>
                                    <input
                                        id="content-title"
                                        type="text"
                                        value={content.title}
                                        onChange={(e) => setContent({ ...content, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Geli cinwaanka..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="content-image-url"
                                        className="block text-sm font-medium mb-2 text-gray-900"
                                    >
                                        URL-ka Sawirka (Optional)
                                    </label>
                                    <div className="space-y-2">
                                        {/* Main Image URL */}
                                        <div className="flex gap-2">
                                            <input
                                                id="content-image-url"
                                                type="url"
                                                value={content.url || ''}
                                                onChange={(e) => setContent({ ...content, url: e.target.value })}
                                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                            {content.url && (
                                                <button
                                                    type="button"
                                                    onClick={() => setContent({ ...content, url: '' })}
                                                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Additional Image URLs */}
                                        {[1, 2, 3, 4, 5].map((index) => {
                                            const urlKey = `url${index}` as keyof ContentBlockData;
                                            // Changed condition to only check if the field exists in the content object
                                            const hasValue = content[urlKey] !== undefined;

                                            console.log(`URL field ${index}:`, {
                                                urlKey,
                                                value: content[urlKey],
                                                hasValue
                                            });

                                            // Only show fields that have been explicitly added
                                            if (!hasValue) return null;

                                            return (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        id={`content-image-url-${index}`}
                                                        type="url"
                                                        value={content[urlKey] as string || ''}
                                                        onChange={(e) => {
                                                            const newContent = { ...content };
                                                            (newContent as any)[urlKey] = e.target.value;
                                                            setContent(newContent);
                                                        }}
                                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        placeholder={`https://example.com/image${index}.jpg`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Remove this URL field and shift remaining URLs up
                                                            const newContent = { ...content };
                                                            // Clear the current URL
                                                            (newContent as any)[urlKey] = undefined;
                                                            // Shift remaining URLs up
                                                            for (let i = index; i < 5; i++) {
                                                                const currentKey = `url${i}` as keyof ContentBlockData;
                                                                const nextKey = `url${i + 1}` as keyof ContentBlockData;
                                                                (newContent as any)[currentKey] = (newContent[nextKey] as string) || undefined;
                                                            }
                                                            setContent(newContent);
                                                        }}
                                                        className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {/* Add Image URL Button */}
                                        {(() => {
                                            // Count how many image URL fields are currently visible/used
                                            const usedFields = [1, 2, 3, 4, 5].filter(index => {
                                                const urlKey = `url${index}` as keyof ContentBlockData;
                                                return content[urlKey] !== undefined;
                                            }).length;

                                            console.log('URL fields state:', {
                                                usedFields,
                                                content
                                            });

                                            // Show button if we haven't used all 5 additional fields
                                            if (usedFields < 5) {
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Find the next available URL field
                                                            const nextIndex = usedFields + 1;
                                                            const nextKey = `url${nextIndex}` as keyof ContentBlockData;

                                                            console.log('Adding new URL field:', {
                                                                nextIndex,
                                                                nextKey
                                                            });

                                                            // Create a new content object with the new URL field
                                                            const newContent = { ...content };
                                                            (newContent as any)[nextKey] = '';

                                                            console.log('New content state:', newContent);

                                                            // Update the state
                                                            setContent(newContent);
                                                        }}
                                                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all duration-200"
                                                    >
                                                        + URL Sawir kale ku dar
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="content-text"
                                    className="block text-sm font-medium mb-2 text-gray-900"
                                >
                                    Qoraalka
                                </label>
                                <RichTextEditor
                                    content={content.text || ''}
                                    onChange={(newVal) => setContent({ ...content, text: newVal })}
                                    placeholder="Geli qoraalka..."
                                />
                            </div>

                            {/* Additional Text Fields */}
                            {[1, 2, 3, 4, 5].map((index) => {
                                const textKey = `text${index}` as keyof ContentBlockData;
                                const hasValue = content[textKey] !== undefined && content[textKey] !== '';

                                // Show field if it has a value or if previous field has value
                                const prevTextKey = `text${index - 1}` as keyof ContentBlockData;
                                const shouldShow = index === 1 || hasValue ||
                                    (content[prevTextKey] !== undefined && content[prevTextKey] !== '');

                                if (!shouldShow) return null;

                                return (
                                    <div key={index}>
                                        <label
                                            htmlFor={`content-text-${index}`}
                                            className="block text-sm font-medium mb-2 text-gray-900"
                                        >
                                            Qoraalka {index}
                                        </label>
                                        <RichTextEditor
                                            content={content[textKey] as string || ''}
                                            onChange={(newVal) => setContent({ ...content, [textKey]: newVal })}
                                            placeholder={`Geli qoraalka ${index}...`}
                                        />
                                    </div>
                                );
                            })}

                            {/* Add Text Field Button */}
                            {(() => {
                                // Count how many text fields are currently visible/used
                                const usedFields = [1, 2, 3, 4, 5].filter(index => {
                                    const textKey = `text${index}` as keyof ContentBlockData;
                                    return content[textKey] !== undefined && content[textKey] !== '';
                                }).length;

                                // Show button if we haven't used all 5 additional fields
                                if (usedFields < 5) {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Find the next available text field
                                                const nextIndex = usedFields + 1;
                                                const nextKey = `text${nextIndex}` as keyof ContentBlockData;
                                                setContent({ ...content, [nextKey]: '' });
                                                setTextFieldCount(Math.max(textFieldCount, nextIndex + 1));
                                            }}
                                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all duration-200"
                                        >
                                            + Qoraal kale ku dar
                                        </button>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                )}

                {content.type === 'problem' && (
                    <div className="space-y-4">
                        {/* Question Type Selection */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Nooca Su'aasha
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setContent({
                                            ...MULTIPLE_CHOICE_EXAMPLE,
                                            order: content.order
                                        })}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-all duration-200"
                                    >
                                        + Tusaale Su'aal ah
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 py-2">
                                <select
                                    id="question-type"
                                    value={content.question_type || 'multiple_choice'}
                                    onChange={(e) => setContent({
                                        ...content,
                                        question_type: e.target.value as ContentBlockData['question_type'],
                                        diagram_config: e.target.value === 'diagram' ? DEFAULT_DIAGRAM_CONFIG : undefined
                                    })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                                >
                                    <option value="multiple_choice">Doorashooyin Badan (Multiple Choice)</option>

                                    <option value="diagram">Diagram</option>
                                </select>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">
                                    Faahfaahinta Su&apos;aasha
                                </h4>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label
                                        htmlFor="question-prefix"
                                        className="block text-sm font-medium mb-2 text-gray-900"
                                    >
                                        Qoraalka ka horreeya su&apos;aasha (Optional)
                                    </label>
                                    <RichTextEditor
                                        content={content.which || ''}
                                        onChange={(newVal) => setContent({ ...content, which: newVal })}
                                        placeholder="Qoraalka ka horreeya su'aasha..."
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="question-text"
                                        className="block text-sm font-medium mb-2 text-gray-900"
                                    >
                                        Su&apos;aasha
                                    </label>
                                    <RichTextEditor
                                        content={content.question_text || ''}
                                        onChange={(newVal) => setContent({ ...content, question_text: newVal })}
                                        placeholder="Geli su'aasha..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            htmlFor="problem-image-url"
                                            className="block text-sm font-medium mb-2 text-gray-900"
                                        >
                                            URL-ka Sawirka (Optional)
                                        </label>
                                        <input
                                            id="problem-image-url"
                                            type="url"
                                            value={content.img || ''}
                                            onChange={(e) => setContent({ ...content, img: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="xp-points"
                                            className="block text-sm font-medium mb-2 text-gray-900"
                                        >
                                            Dhibcaha XP
                                        </label>
                                        <input
                                            id="xp-points"
                                            type="number"
                                            value={content.xp || 10}
                                            onChange={(e) => setContent({ ...content, xp: parseInt(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Problem Video Support */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-900">
                                        Muuqaalka Su&apos;aasha (Optional)
                                    </label>

                                    <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setContent({ ...content, video_source_type: 'upload' })}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${(content.video_source_type || 'upload') === 'upload'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Upload className="w-4 h-4" />
                                            Soo Gali
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setContent({ ...content, video_source_type: 'external' })}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${content.video_source_type === 'external'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Link className="w-4 h-4" />
                                            Link Dibadda ah
                                        </button>
                                    </div>

                                    {/* Upload Section */}
                                    {(content.video_source_type || 'upload') === 'upload' && (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => handleVideoUpload(e, setContent, content)}
                                                    disabled={videoUploading}
                                                    className="hidden"
                                                    id="problem-video-upload"
                                                />
                                                <label
                                                    htmlFor="problem-video-upload"
                                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${videoUploading
                                                        ? 'bg-gray-50 border-gray-300 cursor-not-allowed'
                                                        : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    {videoUploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                            <span className="text-sm font-medium text-gray-600">
                                                                Soo galinayaa... {uploadProgress}%
                                                            </span>
                                                        </div>
                                                    ) : content.video_url ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Video className="w-8 h-8 text-green-500" />
                                                            <span className="text-sm font-medium text-green-600">
                                                                Muuqaal waa la soo galiyay
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Upload className="w-8 h-8 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-600">
                                                                Guji si aad u soo gasho muuqaal
                                                            </span>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                            {content.video_url && !videoUploading && (
                                                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                                                    <video
                                                        src={`${content.video_url}#t=0.1`}
                                                        poster={content.thumbnail_url || undefined}
                                                        controls
                                                        preload="metadata"
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* External Link Section */}
                                    {content.video_source_type === 'external' && (
                                        <div>
                                            <input
                                                type="url"
                                                value={content.video_url || ''}
                                                onChange={(e) => setContent({ ...content, video_url: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="https://example.com/video.mp4"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Question Type Specific Inputs */}
                        {(['multiple_choice', 'single_choice'].includes(content.question_type || '')) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Doorashooyinka
                                    </h4>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Options */}
                                    <div className="space-y-2">
                                        {content.options?.map((option, index) => (
                                            <div key={option.id} className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={`option-${index}`}
                                                        className="block text-sm font-medium mb-2 text-gray-900"
                                                    >
                                                        Doorashada {index + 1}
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            id={`option-${index}`}
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => {
                                                                const newOptions = [...(content.options || [])];
                                                                newOptions[index] = { ...option, text: e.target.value };
                                                                setContent({ ...content, options: newOptions });
                                                            }}
                                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            placeholder={`Doorashada ${index + 1}...`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = content.options?.filter(
                                                                    (_, i) => i !== index
                                                                ) || [];
                                                                const newCorrectAnswer = content.correct_answer?.filter(
                                                                    (ans) => ans.id !== option.id
                                                                ) || [];
                                                                setContent({
                                                                    ...content,
                                                                    options: newOptions,
                                                                    correct_answer: newCorrectAnswer,
                                                                });
                                                            }}
                                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="pt-8">
                                                    <input
                                                        type={content.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                                        name="correct-answer"
                                                        checked={content.correct_answer?.some((ans) => ans.id === option.id)}
                                                        onChange={(e) => {
                                                            if (content.question_type === 'multiple_choice') {
                                                                const newCorrectAnswer = e.target.checked
                                                                    ? [...(content.correct_answer || []), option]
                                                                    : content.correct_answer?.filter((ans) => ans.id !== option.id) || [];
                                                                setContent({ ...content, correct_answer: newCorrectAnswer });
                                                            } else {
                                                                setContent({ ...content, correct_answer: [option] });
                                                            }
                                                        }}
                                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Option Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newOption = {
                                                id: String.fromCharCode(97 + (content.options?.length || 0)),
                                                text: ''
                                            };
                                            setContent({
                                                ...content,
                                                options: [...(content.options || []), newOption]
                                            });
                                        }}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                        + Ku dar doorasho
                                    </button>
                                </div>
                            </div>
                        )}

                        {content.question_type === 'true_false' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Jawaabta Saxda ah
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="true-false"
                                                value="true"
                                                checked={content.correct_answer?.[0]?.id === 'true'}
                                                onChange={() => setContent({
                                                    ...content,
                                                    options: [
                                                        { id: 'true', text: 'Sax' },
                                                        { id: 'false', text: 'Qalad' }
                                                    ],
                                                    correct_answer: [{ id: 'true', text: 'Sax' }]
                                                })}
                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-gray-700">Sax</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="true-false"
                                                value="false"
                                                checked={content.correct_answer?.[0]?.id === 'false'}
                                                onChange={() => setContent({
                                                    ...content,
                                                    options: [
                                                        { id: 'true', text: 'Sax' },
                                                        { id: 'false', text: 'Qalad' }
                                                    ],
                                                    correct_answer: [{ id: 'false', text: 'Qalad' }]
                                                })}
                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-gray-700">Qalad</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {content.question_type === 'fill_blank' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Jawaabta Saxda ah
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <input
                                        type="text"
                                        value={content.correct_answer?.[0]?.text || ''}
                                        onChange={(e) => setContent({
                                            ...content,
                                            correct_answer: [{ id: 'answer', text: e.target.value }]
                                        })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Geli jawaabta saxda ah..."
                                    />
                                </div>
                            </div>
                        )}

                        {content.question_type === 'matching' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Isku Xirka
                                    </h4>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Matching Pairs */}
                                    <div className="space-y-2">
                                        {content.options?.map((option, index) => (
                                            <div key={option.id} className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={`option-left-${index}`}
                                                        className="block text-sm font-medium mb-2 text-gray-900"
                                                    >
                                                        Dhinaca Bidix {index + 1}
                                                    </label>
                                                    <input
                                                        id={`option-left-${index}`}
                                                        type="text"
                                                        value={option.text.split('|||')[0] || ''}
                                                        onChange={(e) => {
                                                            const newOptions = [...(content.options || [])];
                                                            const rightSide = option.text.split('|||')[1] || '';
                                                            newOptions[index] = {
                                                                ...option,
                                                                text: `${e.target.value}|||${rightSide}`
                                                            };
                                                            setContent({ ...content, options: newOptions });
                                                        }}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        placeholder={`Dhinaca bidix ${index + 1}...`}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={`option-right-${index}`}
                                                        className="block text-sm font-medium mb-2 text-gray-900"
                                                    >
                                                        Dhinaca Midig {index + 1}
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            id={`option-right-${index}`}
                                                            type="text"
                                                            value={option.text.split('|||')[1] || ''}
                                                            onChange={(e) => {
                                                                const newOptions = [...(content.options || [])];
                                                                const leftSide = option.text.split('|||')[0] || '';
                                                                newOptions[index] = {
                                                                    ...option,
                                                                    text: `${leftSide}|||${e.target.value}`
                                                                };
                                                                setContent({ ...content, options: newOptions });
                                                            }}
                                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            placeholder={`Dhinaca midig ${index + 1}...`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = content.options?.filter(
                                                                    (_, i) => i !== index
                                                                ) || [];
                                                                setContent({ ...content, options: newOptions });
                                                            }}
                                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Matching Pair Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newOption = {
                                                id: String.fromCharCode(97 + (content.options?.length || 0)),
                                                text: '|||'
                                            };
                                            setContent({
                                                ...content,
                                                options: [...(content.options || []), newOption]
                                            });
                                        }}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                        + Ku dar isku xir cusub
                                    </button>
                                </div>
                            </div>
                        )}

                        {content.question_type === 'open_ended' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Jawaabta La Filayo
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <textarea
                                        value={content.correct_answer?.[0]?.text || ''}
                                        onChange={(e) => setContent({
                                            ...content,
                                            correct_answer: [{ id: 'answer', text: e.target.value }]
                                        })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[150px]"
                                        placeholder="Geli jawaabta la filayo..."
                                    />
                                </div>
                            </div>
                        )}

                        {content.question_type === 'math_expression' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Jawaabta Saxda ah (LaTeX)
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <input
                                        type="text"
                                        value={content.correct_answer?.[0]?.text || ''}
                                        onChange={(e) => setContent({
                                            ...content,
                                            correct_answer: [{ id: 'answer', text: e.target.value }]
                                        })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Geli jawaabta saxda ah ee LaTeX (tusaale: \frac{1}{2})"
                                    />
                                </div>
                            </div>
                        )}

                        {content.question_type === 'code' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Jawaabta Saxda ah (Code)
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <textarea
                                        value={content.correct_answer?.[0]?.text || ''}
                                        onChange={(e) => setContent({
                                            ...content,
                                            correct_answer: [{ id: 'answer', text: e.target.value }]
                                        })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[200px] font-mono"
                                        placeholder="Geli koodka jawaabta saxda ah..."
                                    />
                                </div>
                            </div>
                        )}

                        {content.question_type === 'diagram' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">
                                        Doorashooyinka Diagram-ka
                                    </h4>
                                </div>
                                <div className="p-5 space-y-4">
                                    {/* Diagram Configuration */}
                                    <div className="space-y-2">
                                        <h5 className="font-medium text-gray-900">Diagram Configuration</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-gray-900">
                                                    Diagram ID
                                                </label>
                                                <input
                                                    type="number"
                                                    value={content.diagram_config?.diagram_id || 101}
                                                    onChange={(e) => setContent({
                                                        ...content,
                                                        diagram_config: {
                                                            ...content.diagram_config,
                                                            diagram_id: parseInt(e.target.value)
                                                        } as DiagramConfig
                                                    })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-gray-900">
                                                    Scale Weight
                                                </label>
                                                <input
                                                    type="number"
                                                    value={content.diagram_config?.scale_weight || 15}
                                                    onChange={(e) => setContent({
                                                        ...content,
                                                        diagram_config: {
                                                            ...content.diagram_config,
                                                            scale_weight: parseInt(e.target.value)
                                                        } as DiagramConfig
                                                    })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Objects */}
                                        <div className="space-y-2">
                                            <h6 className="font-medium text-gray-900">Objects</h6>
                                            {content.diagram_config?.objects?.map((obj, index) => (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2 text-gray-900">
                                                            Type
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={obj.type}
                                                            onChange={(e) => {
                                                                const newObjects = [...(content.diagram_config?.objects || [])];
                                                                newObjects[index] = { ...obj, type: e.target.value };
                                                                setContent({
                                                                    ...content,
                                                                    diagram_config: {
                                                                        ...content.diagram_config,
                                                                        objects: newObjects
                                                                    } as DiagramConfig
                                                                });
                                                            }}
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2 text-gray-900">
                                                            Color
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={obj.color}
                                                            onChange={(e) => {
                                                                const newObjects = [...(content.diagram_config?.objects || [])];
                                                                newObjects[index] = { ...obj, color: e.target.value };
                                                                setContent({
                                                                    ...content,
                                                                    diagram_config: {
                                                                        ...content.diagram_config,
                                                                        objects: newObjects
                                                                    } as DiagramConfig
                                                                });
                                                            }}
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2 text-gray-900">
                                                            Number
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={obj.number}
                                                            onChange={(e) => {
                                                                const newObjects = [...(content.diagram_config?.objects || [])];
                                                                newObjects[index] = { ...obj, number: parseInt(e.target.value) };
                                                                setContent({
                                                                    ...content,
                                                                    diagram_config: {
                                                                        ...content.diagram_config,
                                                                        objects: newObjects
                                                                    } as DiagramConfig
                                                                });
                                                            }}
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2 text-gray-900">
                                                            Weight Value
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={obj.weight_value || ''}
                                                            onChange={(e) => {
                                                                const newObjects = [...(content.diagram_config?.objects || [])];
                                                                newObjects[index] = {
                                                                    ...obj,
                                                                    weight_value: e.target.value ? parseInt(e.target.value) : null
                                                                };
                                                                setContent({
                                                                    ...content,
                                                                    diagram_config: {
                                                                        ...content.diagram_config,
                                                                        objects: newObjects
                                                                    } as DiagramConfig
                                                                });
                                                            }}
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2 text-gray-900">
                                                            Position
                                                        </label>
                                                        <select
                                                            value={obj.position}
                                                            onChange={(e) => {
                                                                const newObjects = [...(content.diagram_config?.objects || [])];
                                                                newObjects[index] = { ...obj, position: e.target.value };
                                                                setContent({
                                                                    ...content,
                                                                    diagram_config: {
                                                                        ...content.diagram_config,
                                                                        objects: newObjects
                                                                    } as DiagramConfig
                                                                });
                                                            }}
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        >
                                                            <option value="left">Left</option>
                                                            <option value="center">Center</option>
                                                            <option value="right">Right</option>
                                                        </select>
                                                    </div>
                                                    {/* Remove orientation field as it's replaced by layout */}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const defaultType = 'cube'; // Set to first available type
                                                    const newObject = {
                                                        type: defaultType,
                                                        color: '#FF5733',
                                                        number: 1,
                                                        position: 'left',
                                                        layout: {
                                                            rows: 2,
                                                            columns: 3,
                                                            position: 'center',
                                                            alignment: 'center'
                                                        },
                                                        weight_value: null
                                                    };
                                                    setContent({
                                                        ...content,
                                                        diagram_config: {
                                                            ...content.diagram_config,
                                                            objects: [...(content.diagram_config?.objects || []), newObject]
                                                        } as DiagramConfig
                                                    });
                                                }}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                            >
                                                + Ku dar object
                                            </button>
                                        </div>
                                    </div>

                                    {/* Layout Configuration */}
                                    <div className="space-y-2">
                                        <h6 className="font-medium text-gray-900">Layout Configuration</h6>
                                        {content.diagram_config?.objects?.map((obj, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-gray-900">
                                                        Rows
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={obj.layout.rows}
                                                        onChange={(e) => {
                                                            const newObjects = [...(content.diagram_config?.objects || [])];
                                                            newObjects[index] = {
                                                                ...obj,
                                                                layout: {
                                                                    ...obj.layout,
                                                                    rows: parseInt(e.target.value)
                                                                }
                                                            };
                                                            setContent({
                                                                ...content,
                                                                diagram_config: {
                                                                    ...content.diagram_config,
                                                                    objects: newObjects
                                                                } as DiagramConfig
                                                            });
                                                        }}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-gray-900">
                                                        Columns
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={obj.layout.columns}
                                                        onChange={(e) => {
                                                            const newObjects = [...(content.diagram_config?.objects || [])];
                                                            newObjects[index] = {
                                                                ...obj,
                                                                layout: {
                                                                    ...obj.layout,
                                                                    columns: parseInt(e.target.value)
                                                                }
                                                            };
                                                            setContent({
                                                                ...content,
                                                                diagram_config: {
                                                                    ...content.diagram_config,
                                                                    objects: newObjects
                                                                } as DiagramConfig
                                                            });
                                                        }}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-gray-900">
                                                        Position
                                                    </label>
                                                    <select
                                                        value={obj.layout.position}
                                                        onChange={(e) => {
                                                            const newObjects = [...(content.diagram_config?.objects || [])];
                                                            newObjects[index] = {
                                                                ...obj,
                                                                layout: {
                                                                    ...obj.layout,
                                                                    position: e.target.value as "top" | "bottom" | "left" | "right" | "center"
                                                                }
                                                            };
                                                            setContent({
                                                                ...content,
                                                                diagram_config: {
                                                                    ...content.diagram_config,
                                                                    objects: newObjects
                                                                } as DiagramConfig
                                                            });
                                                        }}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    >
                                                        <option value="top">Top</option>
                                                        <option value="bottom">Bottom</option>
                                                        <option value="left">Left</option>
                                                        <option value="right">Right</option>
                                                        <option value="center">Center</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-gray-900">
                                                        Alignment
                                                    </label>
                                                    <select
                                                        value={obj.layout.alignment}
                                                        onChange={(e) => {
                                                            const newObjects = [...(content.diagram_config?.objects || [])];
                                                            newObjects[index] = {
                                                                ...obj,
                                                                layout: {
                                                                    ...obj.layout,
                                                                    alignment: e.target.value as "left" | "center" | "right"
                                                                }
                                                            };
                                                            setContent({
                                                                ...content,
                                                                diagram_config: {
                                                                    ...content.diagram_config,
                                                                    objects: newObjects
                                                                } as DiagramConfig
                                                            });
                                                        }}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    >
                                                        <option value="left">Left</option>
                                                        <option value="center">Center</option>
                                                        <option value="right">Right</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Options for diagram-type */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2 text-gray-900">
                                            Options
                                        </label>
                                        {(content.options || []).map((option, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={typeof option === 'string' ? option : option.text}
                                                    onChange={e => {
                                                        const newOptions = [...(content.options || [])];
                                                        newOptions[idx] = { id: String(idx + 1), text: e.target.value };
                                                        setContent({ ...content, options: newOptions });
                                                    }}
                                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="radio"
                                                    name="correct_answer"
                                                    checked={content.correct_answer?.[0]?.text === (typeof option === 'string' ? option : option.text)}
                                                    onChange={() => {
                                                        const optionText = typeof option === 'string' ? option : option.text;
                                                        setContent({
                                                            ...content,
                                                            correct_answer: [{ id: String(idx + 1), text: optionText }]
                                                        });
                                                    }}
                                                    className="mt-3"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newOptions = [...(content.options || [])];
                                                        newOptions.splice(idx, 1);
                                                        setContent({ ...content, options: newOptions });
                                                        // If this was the correct answer, clear it
                                                        const optionText = typeof option === 'string' ? option : option.text;
                                                        if (content.correct_answer?.[0]?.text === optionText) {
                                                            setContent({ ...content, correct_answer: [] });
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextId = String(content.options?.length || 0 + 1);
                                                setContent({
                                                    ...content,
                                                    options: [...(content.options || []), { id: nextId, text: '' }]
                                                });
                                            }}
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Explanation Field */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">
                                    Sharaxaad
                                </h4>
                            </div>
                            <div className="p-4">
                                <RichTextEditor
                                    content={content.explanation || ''}
                                    onChange={(newVal) => setContent({ ...content, explanation: newVal })}
                                    placeholder="Sharaxaad ku saabsan jawaabta saxda ah..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {content.type === 'video' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <h4 className="text-base font-semibold text-gray-900">Faahfaahinta Muuqaalka</h4>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="video-title" className="block text-sm font-medium mb-1 text-gray-900">Ciwaanka</label>
                                    <input
                                        id="video-title"
                                        type="text"
                                        value={content.title || ''}
                                        onChange={(e) => setContent({ ...content, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Ciwaanka..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="video-duration" className="block text-sm font-medium mb-1 text-gray-900">Muddada (S)</label>
                                    <input
                                        id="video-duration"
                                        type="number"
                                        value={content.duration || ''}
                                        onChange={(e) => setContent({ ...content, duration: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Seconds..."
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Video Source Toggle */}
                            <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => setContent({ ...content, video_source_type: 'upload' })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${(content.video_source_type || 'upload') === 'upload'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    Soo Gali
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContent({ ...content, video_source_type: 'external' })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${content.video_source_type === 'external'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Link className="w-4 h-4" />
                                    Link Dibadda ah
                                </button>
                            </div>

                            {/* Upload Section */}
                            {(content.video_source_type || 'upload') === 'upload' && (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleVideoUpload(e, setContent, content)}
                                            disabled={videoUploading}
                                            className="hidden"
                                            id="video-file-upload"
                                        />
                                        <label
                                            htmlFor="video-file-upload"
                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${videoUploading
                                                ? 'bg-gray-50 border-gray-300 cursor-not-allowed'
                                                : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                                }`}
                                        >
                                            {videoUploading ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Soo galinayaa... {uploadProgress}%
                                                    </span>
                                                    <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 transition-all duration-300"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : content.url ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Video className="w-8 h-8 text-green-500" />
                                                    <span className="text-sm font-medium text-green-600">
                                                        Muuqaal waa la soo galiyay
                                                    </span>
                                                    <span className="text-xs text-gray-500 truncate max-w-[250px]">
                                                        {content.url}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="w-8 h-8 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Guji si aad u soo gasho muuqaal
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        MP4, WebM, MOV (Max. 2GB)
                                                    </span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {content.url && !videoUploading && (
                                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                                            <video
                                                src={`${content.url}#t=0.1`}
                                                poster={content.thumbnail_url || undefined}
                                                controls
                                                preload="metadata"
                                                className="w-full h-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* External Link Section */}
                            {content.video_source_type === 'external' && (
                                <div>
                                    <label htmlFor="video-url" className="block text-sm font-medium mb-2 text-gray-900">URL-ka Muuqaalka</label>
                                    <input
                                        id="video-url"
                                        type="url"
                                        value={content.url || ''}
                                        onChange={(e) => setContent({ ...content, url: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="video-description" className="block text-sm font-medium mb-2 text-gray-900">Sharaxaada Muuqaalka (Ikhtiyaari)</label>
                                <RichTextEditor
                                    content={content.description || ''}
                                    onChange={(newVal) => setContent({ ...content, description: newVal })}
                                    placeholder="Sharaxaada muuqaalka..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {content.type === 'quiz' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <h4 className="text-base font-semibold text-gray-900">Faahfaahinta Quiz-ka</h4>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label htmlFor="quiz-question" className="block text-sm font-medium mb-2 text-gray-900">Su&apos;aasha Quiz-ka</label>
                                <RichTextEditor
                                    content={content.text || ''}
                                    onChange={(newVal) => setContent({ ...content, text: newVal })}
                                    placeholder="Geli su'aasha quiz-ka..."
                                />
                            </div>

                            {/* Video Source Toggle */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-900">
                                    Muuqaalka Su&apos;aasha (Optional)
                                </label>
                                <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setContent({ ...content, video_source_type: 'upload' })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${(content.video_source_type || 'upload') === 'upload'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        Soo Gali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setContent({ ...content, video_source_type: 'external' })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${content.video_source_type === 'external'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Link className="w-4 h-4" />
                                        Link Dibadda ah
                                    </button>
                                </div>

                                {/* Upload Section */}
                                {(content.video_source_type || 'upload') === 'upload' && (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleVideoUpload(e, setContent, content)}
                                                disabled={videoUploading}
                                                className="hidden"
                                                id="quiz-video-upload"
                                            />
                                            <label
                                                htmlFor="quiz-video-upload"
                                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${videoUploading
                                                    ? 'bg-gray-50 border-gray-300 cursor-not-allowed'
                                                    : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {videoUploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Soo galinayaa... {uploadProgress}%
                                                        </span>
                                                    </div>
                                                ) : content.url ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Video className="w-8 h-8 text-green-500" />
                                                        <span className="text-sm font-medium text-green-600">
                                                            Muuqaal waa la soo galiyay
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Upload className="w-8 h-8 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Guji si aad u soo gasho muuqaal
                                                        </span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* External Link Section */}
                                {content.video_source_type === 'external' && (
                                    <div>
                                        <label htmlFor="quiz-video-url" className="block text-sm font-medium mb-2 text-gray-900">URL-ka Muuqaalka</label>
                                        <input
                                            id="quiz-video-url"
                                            type="url"
                                            value={content.url || ''}
                                            onChange={(e) => setContent({ ...content, url: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="https://example.com/video.mp4"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-900">Doorashooyinka</label>
                                {(content.options || []).map((option, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => {
                                                const newOptions = [...(content.options || [])];
                                                newOptions[idx] = { ...option, text: e.target.value };
                                                setContent({ ...content, options: newOptions });
                                            }}
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                        <input
                                            type="radio"
                                            name="quiz-correct"
                                            checked={content.correct_answer?.[0]?.id === option.id}
                                            onChange={() => setContent({ ...content, correct_answer: [option] })}
                                            className="mt-3"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newOptions = (content.options || []).filter((_, i) => i !== idx);
                                                setContent({ ...content, options: newOptions });
                                            }}
                                            className="text-red-500"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextId = String((content.options || []).length + 1);
                                        setContent({
                                            ...content,
                                            options: [...(content.options || []), { id: nextId, text: '' }]
                                        });
                                    }}
                                    className="text-sm text-blue-600 font-medium"
                                >
                                    + Ku dar doorasho
                                </button>
                            </div>

                            <div>
                                <label htmlFor="quiz-explanation" className="block text-sm font-medium mb-2 text-gray-900">Sharaxaada (Optional)</label>
                                <RichTextEditor
                                    content={content.explanation || ''}
                                    onChange={(newVal) => setContent({ ...content, explanation: newVal })}
                                    placeholder="Sharaxaad ku saabsan jawaabta saxda ah..."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Move fetchProblemDetails inside the component
    const fetchProblemDetails = async (problemId: number) => {
        try {
            const response = await api.get(`lms/problems/${problemId}/`);
            return response.data;
        } catch (err) {
            console.error('Error fetching problem details:', err);
            const apiError = err as ApiError;
            throw new Error(apiError.message || 'Problem details could not be fetched');
        }
    };

    if (loading) return <div className="text-center text-gray-500">Waa la soo saarayaa...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900">
                            Su&apos;aalaha Casharrada
                        </h1>
                        <button
                            onClick={() => setShowAddBlock(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Su&apos;aal cusub
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : blocks.length > 0 ? (
                    <div className="space-y-4">
                        {blocks.map((block) => (
                            <div
                                key={block.id}
                                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-600">
                                                {block.order}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    {renderBlockContent(block)}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                                                        <button
                                                            onClick={() => handleReorder(block.id, block.order - 1)}
                                                            disabled={block.order === 0}
                                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Kor u qaad"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReorder(block.id, block.order + 1)}
                                                            disabled={block.order === blocks.length - 1}
                                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Hoos u dhig"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    if (block.block_type === 'problem' && block.problem) {
                                                                        const problemData = await fetchProblemDetails(block.problem);
                                                                        setEditingContent({
                                                                            type: 'problem',
                                                                            question_type: problemData.question_type,
                                                                            question_text: problemData.question_text,
                                                                            which: problemData.which,
                                                                            options: problemData.options,
                                                                            correct_answer: problemData.correct_answer,
                                                                            explanation: problemData.explanation,
                                                                            content: problemData.content,
                                                                            xp: problemData.xp,
                                                                            img: problemData.img,
                                                                            video_url: problemData.video_url,
                                                                            uploaded_video_id: problemData.uploaded_video,
                                                                            diagram_config: problemData.diagram_config,
                                                                            order: block.order
                                                                        });
                                                                    } else {
                                                                        const content = typeof block.content === 'string' ?
                                                                            JSON.parse(block.content) : block.content;

                                                                        // Ensure type is correctly set based on block_type
                                                                        let inferredType = content.type;
                                                                        if (block.block_type === 'video') inferredType = 'video';
                                                                        else if (block.block_type === 'quiz') inferredType = 'quiz';
                                                                        else if (!inferredType || inferredType === 'text') inferredType = 'qoraal';

                                                                        const editingContentData = {
                                                                            ...content,
                                                                            order: block.order,
                                                                            type: inferredType
                                                                        };

                                                                        setEditingContent(editingContentData);
                                                                    }
                                                                    setEditingBlock(block);
                                                                    setShowEditBlock(true);
                                                                } catch (err) {
                                                                    console.error('Error preparing edit form:', err);
                                                                    const error = err as Error;
                                                                    setEditError(error.message || 'Could not load content for editing');
                                                                }
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Wax ka beddel"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeletingBlock(block);
                                                                setShowDeleteBlock(true);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Tir"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Weli su&apos;aal lama helin</h3>
                            <p className="mt-1 text-sm text-gray-500">Guji &quot;+ Su&apos;aal cusub&quot; si aad u bilowdo.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowAddBlock(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Su&apos;aal cusub
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Add/Edit Block Modal */}
            <ContentBlockModal
                isOpen={showAddBlock || (showEditBlock && !!editingBlock)}
                onClose={() => {
                    const closeModal = showAddBlock ? setShowAddBlock : setShowEditBlock;
                    closeModal(false);
                    setEditingBlock(null);
                    setEditingContent(DEFAULT_CONTENT);
                    setEditError('');
                    setError('');
                }}
                onSubmit={showAddBlock ? (e) => handleAddBlock(e, true) : handleUpdateBlock}
                onSaveAndAddNew={showAddBlock ? (e) => handleAddBlock(e, false) : undefined}
                title={showAddBlock ? 'Qeyb Cusub' : 'Qeybta Beddel'}
                content={editingContent}
                setContent={setEditingContent}
                isAdding={adding}
                error={error || editError}
                renderContentForm={renderContentForm}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteBlock && !!deletingBlock}
                onClose={() => {
                    setDeletingBlock(null);
                    setShowDeleteBlock(false);
                }}
                title="Tir Su'aal"
                description="Ma hubtaa inaad tirto su'aashan? Tani waa mid aan la soo celin karin."
            >
                <div className="px-4 py-3">
                    {deleteError && (
                        <p className="text-sm text-red-600 mb-4">{deleteError}</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setDeletingBlock(null);
                                setShowDeleteBlock(false);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Maya
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteBlock}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Haa, Tir
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}