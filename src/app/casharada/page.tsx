"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, ApiError } from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Modal } from "../components/ui/Modal";
import { Plus, Search, BookOpen, Clock, Layers, Edit, Trash2, Eye } from "lucide-react";

interface Course {
    id: number;
    title: string;
}

interface Lesson {
    id: number;
    title: string;
    slug: string;
    course: number | null;
    lesson_number: number | null;
    estimated_time: number | null;
    is_published: boolean;
    content_blocks: any[];
    created_at: string;
    updated_at: string;
}

function CasharadaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseFilter = searchParams.get('course');

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeCourseId, setActiveCourseId] = useState<number | 'all' | 'none'>(courseFilter ? parseInt(courseFilter) : 'all');

    // Edit modal states
    const [showEdit, setShowEdit] = useState(false);
    const [editLesson, setEditLesson] = useState<Lesson | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCourse, setEditCourse] = useState<number | null>(null);
    const [editLessonNumber, setEditLessonNumber] = useState<number | null>(null);
    const [editEstimatedTime, setEditEstimatedTime] = useState<number | null>(null);
    const [editIsPublished, setEditIsPublished] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete modal states
    const [showDelete, setShowDelete] = useState(false);
    const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Content blocks modal states
    const [showContentBlocks, setShowContentBlocks] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [lessonsRes, coursesRes] = await Promise.all([
                api.get("lms/lessons/"),
                api.get("lms/courses/")
            ]);
            setLessons(lessonsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editLesson) return;

        setEditing(true);
        setEditError("");

        try {
            const res = await api.patch(`lms/lessons/${editLesson.id}/`, {
                title: editTitle,
                course: editCourse,
                lesson_number: editLessonNumber,
                estimated_time: editEstimatedTime,
                is_published: editIsPublished
            });

            setLessons(lessons.map(lesson => lesson.id === editLesson.id ? res.data : lesson));
            setShowEdit(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setEditError(apiError.response?.data?.detail || apiError.message || "Cashar lama beddeli karin");
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingLesson) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await api.delete(`lms/lessons/${deletingLesson.id}/`);
            setLessons(lessons.filter(lesson => lesson.id !== deletingLesson.id));
            setShowDelete(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setDeleteError(apiError.response?.data?.detail || apiError.message || "Cashar lama tiri karin");
        } finally {
            setDeleting(false);
        }
    };

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                        Casharada
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg">
                        Halkan waxaad ka maamuli kartaa casharada. Dooro ama raadso cashar si aad u bilowdo.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Raadi cashar..."
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <svg
                            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <button
                        className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        onClick={() => router.push('/casharada/cusub')}
                    >
                        <Plus className="w-5 h-5" />
                        <span>Cashar cusub</span>
                    </button>
                </div>

                {/* Course Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 mb-6 border-b border-gray-100">
                    <button
                        onClick={() => setActiveCourseId('all')}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${activeCourseId === 'all'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        Dhammaan
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCourseId === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {filteredLessons.length}
                        </span>
                    </button>
                    {courses.map(course => {
                        const count = filteredLessons.filter(l => l.course === course.id).length;
                        if (count === 0 && search) return null;
                        return (
                            <button
                                key={course.id}
                                onClick={() => setActiveCourseId(course.id)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${activeCourseId === course.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                {course.title}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCourseId === course.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                    {filteredLessons.some(l => !l.course) && (
                        <button
                            onClick={() => setActiveCourseId('none')}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${activeCourseId === 'none'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                }`}
                        >
                            Koorso la'aan
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCourseId === 'none' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {filteredLessons.filter(l => !l.course).length}
                            </span>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-12">Soo loading...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredLessons
                            .filter(lesson => {
                                if (activeCourseId === 'all') return true;
                                if (activeCourseId === 'none') return !lesson.course;
                                return lesson.course === activeCourseId;
                            })
                            .map(lesson => (
                                <div key={lesson.id} className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group relative">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 text-base font-bold shadow-inner">
                                                    {lesson.lesson_number || '#'}
                                                </span>
                                                <div className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {lesson.title}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                    <Clock className="w-4 h-4 text-blue-400" />
                                                    <span className="font-medium text-gray-600">
                                                        {lesson.estimated_time ? `${lesson.estimated_time} daqiiqo` : 'Waqti ma jiro'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                    <Layers className="w-4 h-4 text-purple-400" />
                                                    <span className="font-medium text-gray-600">{lesson.content_blocks.length} qeybood</span>
                                                </div>
                                                {activeCourseId === 'all' && (
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg min-w-0 max-w-[200px]">
                                                        <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                        <span className="truncate font-medium text-gray-600">{courses.find(c => c.id === lesson.course)?.title || 'Koorso la\'aan'}</span>
                                                    </div>
                                                )}
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${lesson.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${lesson.is_published ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                                    <span className="font-bold text-xs uppercase tracking-wider">
                                                        {lesson.is_published ? 'Daabacan' : 'Qabyo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-bold shadow-md shadow-blue-100 flex items-center gap-2"
                                                onClick={() => router.push(`/casharada/${lesson.id}/qeybaha`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>Eeg Qeybaha</span>
                                            </button>

                                            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                <button
                                                    className="p-2 rounded-lg text-amber-600 hover:bg-white hover:shadow-sm transition-all"
                                                    title="Wax ka beddel"
                                                    onClick={() => {
                                                        setEditLesson(lesson);
                                                        setEditTitle(lesson.title);
                                                        setEditCourse(lesson.course);
                                                        setEditLessonNumber(lesson.lesson_number);
                                                        setEditEstimatedTime(lesson.estimated_time);
                                                        setEditIsPublished(lesson.is_published);
                                                        setShowEdit(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg text-red-600 hover:bg-white hover:shadow-sm transition-all"
                                                    title="Tir"
                                                    onClick={() => {
                                                        setDeletingLesson(lesson);
                                                        setShowDelete(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {filteredLessons.length === 0 && (
                            <div className="text-gray-400 text-center p-12 bg-white rounded-xl border border-gray-100">
                                Cashar lama helin.
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Modal */}
                <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Cashar wax ka beddel">
                    <form onSubmit={handleEdit} className="space-y-4">
                        {editError && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {editError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cinwaanka</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-4 py-2"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Koorso</label>
                            <select
                                className="w-full border rounded-lg px-4 py-2"
                                value={editCourse || ""}
                                onChange={e => setEditCourse(e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="">Dooro koorso...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lambarka cashar</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg px-4 py-2"
                                value={editLessonNumber || ""}
                                onChange={e => setEditLessonNumber(e.target.value ? parseInt(e.target.value) : null)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Waqtiga qiyaasta ah (Ikhtiyaari)</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg px-4 py-2"
                                value={editEstimatedTime || ""}
                                onChange={e => setEditEstimatedTime(e.target.value ? parseInt(e.target.value) : null)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="editIsPublished"
                                checked={editIsPublished}
                                onChange={e => setEditIsPublished(e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="editIsPublished" className="text-sm text-gray-700">Daabac</label>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => setShowEdit(false)}
                            >
                                Ka noqo
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                disabled={editing}
                            >
                                {editing ? "Beddelaayo..." : "Beddel"}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Modal */}
                <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Cashar tir">
                    <div className="space-y-4">
                        {deleteError && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {deleteError}
                            </div>
                        )}
                        <p className="text-gray-700">
                            Ma hubtaa inaad rabto inaad tirto casharkan: <strong>{deletingLesson?.title}</strong>?
                        </p>
                        <div className="flex gap-2 justify-end pt-4">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => setShowDelete(false)}
                            >
                                Ka noqo
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Tiraayo..." : "Tir"}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout >
    );
}

export default function CasharadaPage() {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <div className="text-center text-gray-500 py-12">Soo loading...</div>
            </DashboardLayout>
        }>
            <CasharadaContent />
        </Suspense>
    );
}
