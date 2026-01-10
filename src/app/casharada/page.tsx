"use client";

import { useState, useEffect } from "react";
import { api, ApiError } from "../api";
import DashboardLayout from "../components/DashboardLayout";
import LessonContentBlocks from "../components/LessonContentBlocks";
import { Modal } from "../components/ui/Modal";

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

export default function CasharadaPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeCourseId, setActiveCourseId] = useState<number | 'all' | 'none'>('all');

    // Create modal states
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newCourse, setNewCourse] = useState<number | null>(null);
    const [newLessonNumber, setNewLessonNumber] = useState<number | null>(null);
    const [newEstimatedTime, setNewEstimatedTime] = useState<number | null>(null);
    const [newIsPublished, setNewIsPublished] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateError("");

        try {
            const res = await api.post("lms/lessons/", {
                title: newTitle,
                course: newCourse,
                lesson_number: newLessonNumber,
                estimated_time: newEstimatedTime,
                is_published: newIsPublished
            });

            setLessons([...lessons, res.data]);
            setNewTitle("");
            setNewCourse(null);
            setNewLessonNumber(null);
            setNewEstimatedTime(null);
            setNewIsPublished(false);
            setShowCreate(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setCreateError(apiError.response?.data?.detail || apiError.message || "Cashar lama sameyn karin");
        } finally {
            setCreating(false);
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
                        onClick={() => setShowCreate(true)}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
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
                                <div key={lesson.id} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">
                                                    {lesson.lesson_number || '#'}
                                                </span>
                                                <div className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {lesson.title}
                                                </div>
                                            </div>
                                            <div className="text-gray-500 text-sm flex flex-wrap gap-x-6 gap-y-2 mt-4">
                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {lesson.estimated_time ? `${lesson.estimated_time} daqiiqo` : 'Waqti ma jiro'}
                                                </div>
                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    {lesson.content_blocks.length} qeybood
                                                </div>
                                                {activeCourseId === 'all' && (
                                                    <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                                                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                        <span className="truncate">{courses.find(c => c.id === lesson.course)?.title || 'Koorso la\'aan'}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                    <div className={`w-2 h-2 rounded-full ${lesson.is_published ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    <span className={lesson.is_published ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                                        {lesson.is_published ? 'Daabacan' : 'Qabyo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col lg:flex-row gap-2 sm:w-auto w-full">
                                            <button
                                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                                onClick={() => {
                                                    setSelectedLesson(lesson);
                                                    setShowContentBlocks(true);
                                                }}
                                            >
                                                <span>Qeybaha</span>
                                            </button>
                                            <button
                                                className="flex-shrink-0 p-2.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
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
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="flex-shrink-0 p-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                                title="Tir"
                                                onClick={() => {
                                                    setDeletingLesson(lesson);
                                                    setShowDelete(true);
                                                }}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
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

                {/* Create Modal */}
                <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Cashar cusub samee">
                    <form onSubmit={handleCreate} className="space-y-4">
                        {createError && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {createError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cinwaanka</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-4 py-2"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Koorso</label>
                            <select
                                className="w-full border rounded-lg px-4 py-2"
                                value={newCourse || ""}
                                onChange={e => setNewCourse(e.target.value ? parseInt(e.target.value) : null)}
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
                                value={newLessonNumber || ""}
                                onChange={e => setNewLessonNumber(e.target.value ? parseInt(e.target.value) : null)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Waqtiga qiyaasta ah (daqiiqo)</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg px-4 py-2"
                                value={newEstimatedTime || ""}
                                onChange={e => setNewEstimatedTime(e.target.value ? parseInt(e.target.value) : null)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="newIsPublished"
                                checked={newIsPublished}
                                onChange={e => setNewIsPublished(e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="newIsPublished" className="text-sm text-gray-700">Daabac</label>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => setShowCreate(false)}
                            >
                                Ka noqo
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                disabled={creating}
                            >
                                {creating ? "Sameynaayo..." : "Samee"}
                            </button>
                        </div>
                    </form>
                </Modal>

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Waqtiga qiyaasta ah (daqiiqo)</label>
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

                {/* Content Blocks Modal */}
                <Modal isOpen={showContentBlocks} onClose={() => setShowContentBlocks(false)} title={`Qeybaha: ${selectedLesson?.title}`}>
                    {selectedLesson && (
                        <LessonContentBlocks lessonId={selectedLesson.id} onUpdate={fetchData} />
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
}
