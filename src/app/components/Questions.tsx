import { useState, useEffect } from 'react';
import { api, ApiError } from '../api';
import LessonContentBlocks from './LessonContentBlocks';
import { Modal } from './ui/Modal';

interface ContentBlock {
    id: number;
    type: string;
    block_type: 'text' | 'example' | 'code' | 'image' | 'video' | 'quiz';
    content: {
        text?: string;
        format?: string;
        code?: string;
        language?: string;
        explanation?: string | null;
        url?: string;
        caption?: string | null;
        width?: number | null;
        height?: number | null;
        alt_text?: string | null;
        title?: string;
        description?: string | null;
        duration?: number | null;
        question?: string;
        options?: string[];
        correct_answer?: number;
    };
    order: number;
    lesson: number;
}

interface Lesson {
    id: number;
    title: string;
    course: number;
    lesson_number: number;
    estimated_time: number;
    is_published: boolean;
    content_blocks: ContentBlock[];
    created_at: string;
    updated_at: string;
}

interface Course {
    id: number;
    title: string;
}

export default function Questions() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showContentBlocks, setShowContentBlocks] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch lessons and courses
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [lessonsRes, coursesRes] = await Promise.all([
                    api.get('lms/lessons/'),
                    api.get('lms/courses/')
                ]);
                setLessons(lessonsRes.data);
                setCourses(coursesRes.data);
            } catch (err) {
                const apiError = err as ApiError;
                setError(apiError.message || 'Xogta lama soo saari karin');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center text-gray-500 animate-pulse">Soo loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(search.toLowerCase()) ||
        courses.find(c => c.id === lesson.course)?.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full mt-10 min-w-full mx-auto p-6">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                        Su&apos;aalaha
                    </h1>
                    <p className="text-gray-600">
                        Halkan waxaad ka maamuli kartaa su&apos;aalaha casharrada. Dooro cashar si aad u bilowdo.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Raadi cashar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map(lesson => (
                        <div
                            key={lesson.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                        {lesson.title}
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>Koorso: {courses.find(c => c.id === lesson.course)?.title || 'Ma jiro'}</p>
                                        <p>Lambarka cashar: {lesson.lesson_number}</p>
                                        <p>Su&apos;aalaha: {lesson.content_blocks.length}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setSelectedLesson(lesson);
                                            setShowContentBlocks(true);
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
                                    >
                                        Eeg Su&apos;aalaha
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredLessons.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-600">
                                {search ? 'Cashar lama helin raadinta.' : 'Weli cashar lama helin.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Blocks Modal */}
            <Modal
                isOpen={showContentBlocks && !!selectedLesson}
                onClose={() => {
                    setShowContentBlocks(false);
                    setSelectedLesson(null);
                }}
                title="Qeybaha Casharrada"
            >
                {selectedLesson && (
                    <div className="p-6">
                        <LessonContentBlocks
                            lessonId={selectedLesson.id}
                            onUpdate={() => {
                                api.get('lms/lessons/').then(res => {
                                    setLessons(res.data);
                                });
                            }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
} 