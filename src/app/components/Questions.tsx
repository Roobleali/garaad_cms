import { useState, useEffect } from 'react';
import { api, ApiError } from '../api';
import { Modal } from './ui/Modal';
import { Search, BookOpen, Layers, Eye, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Raadi cashar ama koorso..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-14 pr-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none shadow-sm"
                    />
                    <Search className="absolute left-5 top-4 w-6 h-6 text-gray-300" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map(lesson => (
                        <div
                            key={lesson.id}
                            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shadow-inner">
                                            {lesson.lesson_number}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                            <Layers className="w-3 h-3" />
                                            <span>{lesson.content_blocks.length} Su&apos;aalood</span>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {lesson.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                        <BookOpen className="w-4 h-4 text-emerald-400" />
                                        <span className="truncate">{courses.find(c => c.id === lesson.course)?.title || 'Ma jiro'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => router.push(`/casharada/${lesson.id}/qeybaha`)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Eeg</span>
                                    </button>
                                    <button
                                        onClick={() => router.push(`/sualaha/cusub?lesson=${lesson.id}`)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Ku dar</span>
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
        </div>
    );
}