"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "../../../api";
import DashboardLayout from "../../../components/DashboardLayout";
import LessonContentBlocks from "../../../components/LessonContentBlocks";
import { ArrowLeft, Loader2, BookOpen, Layers } from "lucide-react";

interface Lesson {
    id: number;
    title: string;
    course: number | null;
}

interface Course {
    id: number;
    title: string;
}

export default function LessonSectionsPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.id;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (lessonId) {
            fetchData();
        }
    }, [lessonId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const lessonRes = await api.get(`lms/lessons/${lessonId}/`);
            setLesson(lessonRes.data);

            if (lessonRes.data.course) {
                const courseRes = await api.get(`lms/courses/${lessonRes.data.course}/`);
                setCourse(courseRes.data);
            }
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.detail || apiError.message || "Xogta casharka lama helin.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Soo loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !lesson) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 mb-6">
                        {error || "Casharka lama helin."}
                    </div>
                    <button
                        onClick={() => router.push('/casharada')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                        Ku laabo Casharada
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Dib u laabo</span>
                        </button>

                        <div>
                            <div className="flex items-center gap-3 text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
                                <Layers className="w-4 h-4" />
                                <span>Maamulka Qeybaha Casharka</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                {lesson.title}
                            </h1>
                            {course && (
                                <div className="flex items-center gap-2 text-gray-500 mt-2 font-medium">
                                    <BookOpen className="w-4 h-4 text-emerald-500" />
                                    <span>{course.title}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-1">
                        <LessonContentBlocks lessonId={lesson.id} onUpdate={fetchData} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
