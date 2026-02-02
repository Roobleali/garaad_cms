"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface Course {
    id: number;
    title: string;
}

export default function NewLessonPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Form states
    const [title, setTitle] = useState("");
    const [courseId, setCourseId] = useState<number | "">("");
    const [lessonNumber, setLessonNumber] = useState<number | "">("");
    const [estimatedTime, setEstimatedTime] = useState<number | "">("");
    const [isPublished, setIsPublished] = useState(false);

    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get("lms/courses/");
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError("");

        try {
            const res = await api.post("lms/lessons/", {
                title,
                course: courseId || null,
                lesson_number: lessonNumber || null,
                estimated_time: estimatedTime || null,
                is_published: isPublished
            });

            // Redirect back to lessons list or the new lesson's editor
            router.push(`/casharada?course=${courseId}`);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.detail || apiError.message || "Cashar lama sameyn karin");
        } finally {
            setCreating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto animate-fade-in">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Dib u laabo</span>
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-transparent">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cashar Cusub Samee</h1>
                        <p className="text-gray-500">Buuxi xogta casharka si aad ugu darto koorsada.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cinwaanka Casharka</label>
                                <input
                                    type="text"
                                    placeholder="Tusaale: Hordhaca JS"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Koorsada</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                                    value={courseId}
                                    onChange={e => setCourseId(e.target.value ? parseInt(e.target.value) : "")}
                                    disabled={loadingCourses}
                                >
                                    <option value="">Dooro koorso...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Lambarka Casharka</label>
                                <input
                                    type="number"
                                    placeholder="Tusaale: 1"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    value={lessonNumber}
                                    onChange={e => setLessonNumber(e.target.value ? parseInt(e.target.value) : "")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Waqtiga (Daqiiqo)</label>
                                <input
                                    type="number"
                                    placeholder="Tusaale: 15"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    value={estimatedTime}
                                    onChange={e => setEstimatedTime(e.target.value ? parseInt(e.target.value) : "")}
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsPublished(!isPublished)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublished ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`${isPublished ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </button>
                                <span className="text-sm font-medium text-gray-700">Daabac casharka</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 h-12 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Ka noqo
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-8 h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Keydinayaa...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Keydi Casharka</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
