"use client";

import { useState, useEffect } from "react";
import { api, ApiError } from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Modal } from "../components/ui/Modal";

interface Category {
    id: string;
    title: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail?: string;
    category: string | null;
    is_published: boolean;
    sequence?: number;
}

export default function KoorsooyinkaPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Create modal states
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newThumbnail, setNewThumbnail] = useState("");
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [newSequence, setNewSequence] = useState(0);
    const [newIsPublished, setNewIsPublished] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Edit modal states
    const [showEdit, setShowEdit] = useState(false);
    const [editCourse, setEditCourse] = useState<Course | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editThumbnail, setEditThumbnail] = useState("");
    const [editCategory, setEditCategory] = useState<string | null>(null);
    const [editSequence, setEditSequence] = useState(0);
    const [editIsPublished, setEditIsPublished] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete modal states
    const [showDelete, setShowDelete] = useState(false);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, categoriesRes] = await Promise.all([
                api.get("lms/courses/"),
                api.get("lms/categories/")
            ]);
            setCourses(coursesRes.data);
            setCategories(categoriesRes.data);
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
            const res = await api.post("lms/courses/", {
                title: newTitle,
                description: newDescription,
                thumbnail: newThumbnail || null,
                category: newCategory,
                sequence: newSequence,
                is_published: newIsPublished,
                author_id: 1
            });

            setCourses([...courses, res.data]);
            setNewTitle("");
            setNewDescription("");
            setNewThumbnail("");
            setNewCategory(null);
            setNewSequence(0);
            setNewIsPublished(false);
            setShowCreate(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setCreateError(apiError.response?.data?.detail || apiError.message || "Koorso lama sameyn karin");
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCourse) return;

        setEditing(true);
        setEditError("");

        try {
            const res = await api.patch(`lms/courses/${editCourse.id}/`, {
                title: editTitle,
                description: editDescription,
                thumbnail: editThumbnail || null,
                category: editCategory,
                sequence: editSequence,
                is_published: editIsPublished
            });

            setCourses(courses.map(course => course.id === editCourse.id ? res.data : course));
            setShowEdit(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setEditError(apiError.response?.data?.detail || apiError.message || "Koorso lama beddeli karin");
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCourse) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await api.delete(`lms/courses/${deletingCourse.id}/`);
            setCourses(courses.filter(course => course.id !== deletingCourse.id));
            setShowDelete(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setDeleteError(apiError.response?.data?.detail || apiError.message || "Koorso lama tiri karin");
        } finally {
            setDeleting(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
        const seqA = (a.sequence && a.sequence > 0) ? a.sequence : -1;
        const seqB = (b.sequence && b.sequence > 0) ? b.sequence : -1;
        return seqB - seqA;
    });

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                        Koorsooyinka
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg">
                        Halkan waxaad ka maamuli kartaa koorsooyinka. Dooro ama raadso koorso si aad u bilowdo.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Raadi koorso..."
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
                        <span>Koorso cusub</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500">Soo loading...</div>
                ) : (
                    <div className="space-y-3">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-semibold text-lg text-blue-700">{course.title}</div>
                                        <div className="text-gray-500 text-sm mt-1">{course.description}</div>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                            <span>Qayb: {categories.find(c => c.id === course.category)?.title || 'Ma jiro'}</span>
                                            <span>Xaalada: {course.is_published ? 'Daabacan' : 'Daabac ma\'ahan'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />}
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
                                                onClick={() => {
                                                    setEditCourse(course);
                                                    setEditTitle(course.title);
                                                    setEditDescription(course.description);
                                                    setEditThumbnail(course.thumbnail || "");
                                                    setEditCategory(course.category ? String(course.category) : null);
                                                    setEditSequence(course.sequence || 0);
                                                    setEditIsPublished(course.is_published);
                                                    setShowEdit(true);
                                                }}
                                            >
                                                Wax ka beddel
                                            </button>
                                            <button
                                                className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
                                                onClick={() => {
                                                    setDeletingCourse(course);
                                                    setShowDelete(true);
                                                }}
                                            >
                                                Tir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredCourses.length === 0 && (
                            <div className="text-gray-400 text-center p-12 bg-white rounded-xl border border-gray-100">
                                Koorsooyin lama helin.
                            </div>
                        )}
                    </div>
                )}

                {/* Create Modal */}
                <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Koorso cusub samee">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sharaxaada</label>
                            <textarea
                                className="w-full border rounded-lg px-4 py-2"
                                rows={3}
                                value={newDescription}
                                onChange={e => setNewDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sawirka URL</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-4 py-2"
                                value={newThumbnail}
                                onChange={e => setNewThumbnail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Qayb</label>
                            <select
                                className="w-full border rounded-lg px-4 py-2"
                                value={newCategory || ""}
                                onChange={e => setNewCategory(e.target.value || null)}
                            >
                                <option value="">Dooro qayb...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Isku xigxiga</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg px-4 py-2"
                                value={newSequence}
                                onChange={e => setNewSequence(parseInt(e.target.value))}
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
                <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Koorso wax ka beddel">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sharaxaada</label>
                            <textarea
                                className="w-full border rounded-lg px-4 py-2"
                                rows={3}
                                value={editDescription}
                                onChange={e => setEditDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sawirka URL</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-4 py-2"
                                value={editThumbnail}
                                onChange={e => setEditThumbnail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Qayb</label>
                            <select
                                className="w-full border rounded-lg px-4 py-2"
                                value={editCategory || ""}
                                onChange={e => setEditCategory(e.target.value || null)}
                            >
                                <option value="">Dooro qayb...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Isku xigxiga</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg px-4 py-2"
                                value={editSequence}
                                onChange={e => setEditSequence(parseInt(e.target.value))}
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
                <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Koorso tir">
                    <div className="space-y-4">
                        {deleteError && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {deleteError}
                            </div>
                        )}
                        <p className="text-gray-700">
                            Ma hubtaa inaad rabto inaad tirto koorsokan: <strong>{deletingCourse?.title}</strong>?
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
        </DashboardLayout>
    );
}
