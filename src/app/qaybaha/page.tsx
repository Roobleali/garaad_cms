"use client";

import { useState, useEffect } from "react";
import { api, ApiError, ApiResponse } from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Modal } from "../components/ui/Modal";

interface Category {
    id: string;
    title: string;
    description: string;
    image?: string;
    sequence: number;
}

export default function QaybahaPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Create modal states
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newImage, setNewImage] = useState("");
    const [newSequence, setNewSequence] = useState(0);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Edit modal states
    const [showEdit, setShowEdit] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editImage, setEditImage] = useState("");
    const [editSequence, setEditSequence] = useState(0);
    const [editing, setEditing] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete modal states
    const [showDelete, setShowDelete] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("lms/categories/");
            setCategories(res.data.sort((a: Category, b: Category) => {
                const seqA = (a.sequence && a.sequence > 0) ? a.sequence : -1;
                const seqB = (b.sequence && b.sequence > 0) ? b.sequence : -1;
                return seqB - seqA;
            }));
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateError("");

        const existingIds = categories.map(cat => parseInt(cat.id)).filter(id => !isNaN(id));
        let newId: number;
        do {
            newId = Math.floor(Math.random() * 1000000) + 1;
        } while (existingIds.includes(newId));

        try {
            const res = await api.post("lms/categories/", {
                id: newId,
                title: newTitle,
                description: newDescription,
                image: newImage || null,
                sequence: newSequence
            });

            setCategories([...categories, res.data].sort((a, b) => a.sequence - b.sequence));
            setNewTitle("");
            setNewDescription("");
            setNewImage("");
            setNewSequence(0);
            setShowCreate(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setCreateError(apiError.response?.data?.detail || apiError.message || "Qayb lama sameyn karin");
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCategory) return;

        setEditing(true);
        setEditError("");

        try {
            const res = await api.patch(`lms/categories/${editCategory.id}/`, {
                id: editCategory.id,
                title: editTitle,
                description: editDescription,
                image: editImage || null,
                sequence: editSequence
            });

            setCategories(categories.map(cat => cat.id === editCategory.id ? res.data : cat).sort((a, b) => a.sequence - b.sequence));
            setShowEdit(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setEditError(apiError.response?.data?.detail || apiError.message || "Qayb lama beddeli karin");
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory) return;

        setDeleting(true);
        setDeleteError("");

        try {
            await api.delete(`lms/categories/${deletingCategory.id}/`);
            setCategories(categories.filter(cat => cat.id !== deletingCategory.id));
            setShowDelete(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setDeleteError(apiError.response?.data?.detail || apiError.message || "Qayb lama tiri karin");
        } finally {
            setDeleting(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                        Qaybaha
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg">
                        Halkan waxaad ka maamuli kartaa qaybaha. Dooro ama raadso qayb si aad u bilowdo.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Raadi qayb..."
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
                        <span>Qayb cusub</span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCategories.map(cat => (
                            <div
                                key={cat.id}
                                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-800 mb-2">{cat.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{cat.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        {cat.image ? (
                                            <img
                                                src={cat.image}
                                                alt={cat.title}
                                                className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                📷
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors duration-200 text-sm font-medium"
                                                onClick={() => {
                                                    setEditCategory(cat);
                                                    setEditTitle(cat.title);
                                                    setEditDescription(cat.description);
                                                    setEditImage(cat.image || "");
                                                    setEditSequence(cat.sequence || 0);
                                                    setShowEdit(true);
                                                }}
                                            >
                                                Wax ka beddel
                                            </button>
                                            <button
                                                className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                                                onClick={() => {
                                                    setDeletingCategory(cat);
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
                        {filteredCategories.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100">
                                <div className="text-5xl mb-4">📂</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Qaybo lama helin</h3>
                                <p className="text-gray-500 text-center">
                                    Wali qayb lama sameyn. Ku bilow inaad sameyso qayb cusub.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Modal */}
                <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Qayb cusub samee">
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
                                value={newImage}
                                onChange={e => setNewImage(e.target.value)}
                            />
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
                <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Qayb wax ka beddel">
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
                                value={editImage}
                                onChange={e => setEditImage(e.target.value)}
                            />
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
                <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Qayb tir">
                    <div className="space-y-4">
                        {deleteError && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {deleteError}
                            </div>
                        )}
                        <p className="text-gray-700">
                            Ma hubtaa inaad rabto inaad tirto qayban: <strong>{deletingCategory?.title}</strong>?
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
