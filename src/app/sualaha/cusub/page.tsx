"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { ArrowLeft, Save, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface Lesson {
    id: number;
    title: string;
    course: number;
}

interface Course {
    id: number;
    title: string;
}

interface Option {
    id: string;
    text: string;
}

function NewQuestionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedLessonId = searchParams.get('lesson');

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form states
    const [lessonId, setLessonId] = useState<number | "">(preselectedLessonId ? parseInt(preselectedLessonId) : "");
    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("single_choice");
    const [explanation, setExplanation] = useState("");
    const [which, setWhich] = useState("");
    const [xp, setXp] = useState(10);

    // Options states
    const [options, setOptions] = useState<Option[]>([
        { id: "1", text: "" },
        { id: "2", text: "" }
    ]);
    const [correctAnswerIds, setCorrectAnswerIds] = useState<string[]>([]);

    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [lessonsRes, coursesRes] = await Promise.all([
                api.get("lms/lessons/"),
                api.get("lms/courses/")
            ]);
            setLessons(lessonsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleAddOption = () => {
        const newId = (options.length + 1).toString();
        setOptions([...options, { id: newId, text: "" }]);
    };

    const handleRemoveOption = (id: string) => {
        if (options.length <= 2) return;
        setOptions(options.filter(opt => opt.id !== id));
        setCorrectAnswerIds(correctAnswerIds.filter(ansId => ansId !== id));
    };

    const handleOptionChange = (id: string, text: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const toggleCorrectAnswer = (id: string) => {
        if (questionType === "single_choice") {
            setCorrectAnswerIds([id]);
        } else {
            if (correctAnswerIds.includes(id)) {
                setCorrectAnswerIds(correctAnswerIds.filter(ansId => ansId !== id));
            } else {
                setCorrectAnswerIds([...correctAnswerIds, id]);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!lessonId) {
            setError("Fadlan dooro cashar.");
            return;
        }

        if (correctAnswerIds.length === 0) {
            setError("Fadlan dooro ugu yaraan hal jawaab oo sax ah.");
            return;
        }

        setCreating(true);
        setError("");

        try {
            // First create the problem
            const problemData = {
                lesson: lessonId,
                which: which || null,
                question_text: questionText,
                question_type: questionType,
                options: options.filter(opt => opt.text.trim() !== ""),
                correct_answer: options.filter(opt => correctAnswerIds.includes(opt.id)),
                explanation,
                xp,
                content: {
                    type: questionType,
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
                order: 0 // Will be handled by backend or just set to 0
            };

            const problemRes = await api.post("lms/problems/", problemData);

            // Then create the content block
            await api.post("lms/lesson-content-blocks/", {
                block_type: "problem",
                content: {},
                order: 999, // Should be appended
                lesson: lessonId,
                problem: problemRes.data.id
            });

            router.push(`/sualaha?lesson=${lessonId}`);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError.response?.data?.detail || apiError.message || "Su'aal lama sameyn karin");
        } finally {
            setCreating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto animate-fade-in pb-12">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Dib u laabo</span>
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-transparent flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Su&apos;aal Cusub</h1>
                            <p className="text-gray-500">Si fudud ugu dar su&apos;aal casharadaada.</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Simplified UI
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        {/* Basic Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Casharka</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                                    value={lessonId}
                                    onChange={e => setLessonId(e.target.value ? parseInt(e.target.value) : "")}
                                    disabled={loadingData}
                                    required
                                >
                                    <option value="">Dooro cashar...</option>
                                    {lessons.sort((a, b) => a.course - b.course).map(lesson => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {courses.find(c => c.id === lesson.course)?.title} - {lesson.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Su&apos;aasha</label>
                                <textarea
                                    placeholder="Qor su&apos;aasha halkan..."
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none min-h-[100px]"
                                    value={questionText}
                                    onChange={e => setQuestionText(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nooca Su&apos;aasha</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                                    value={questionType}
                                    onChange={e => {
                                        setQuestionType(e.target.value);
                                        if (e.target.value === "single_choice" && correctAnswerIds.length > 1) {
                                            setCorrectAnswerIds([correctAnswerIds[0]]);
                                        }
                                    }}
                                >
                                    <option value="single_choice">Hal doorasho (Single Choice)</option>
                                    <option value="multiple_choice">Dhowr doorasho (Multiple Choice)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">XP (Dhibcaha)</label>
                                <input
                                    type="number"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    value={xp}
                                    onChange={e => setXp(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Options Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-800 uppercase tracking-wider">Doorashooyinka (Options)</label>
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ku dar doorasho
                                </button>
                            </div>

                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={option.id} className="flex items-center gap-3 group">
                                        <button
                                            type="button"
                                            onClick={() => toggleCorrectAnswer(option.id)}
                                            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${correctAnswerIds.includes(option.id)
                                                ? "bg-green-100 text-green-600 shadow-sm border border-green-200"
                                                : "bg-gray-100 text-gray-400 hover:bg-gray-200 border border-transparent"
                                                }`}
                                            title={correctAnswerIds.includes(option.id) ? "Jawaab sax ah" : "U calaamadee inay sax tahay"}
                                        >
                                            <CheckCircle2 className="w-6 h-6" />
                                        </button>
                                        <input
                                            type="text"
                                            placeholder={`Doorashada ${index + 1}...`}
                                            className="flex-1 h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            value={option.text}
                                            onChange={e => handleOptionChange(option.id, e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(option.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            disabled={options.length <= 2}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Explanation Section */}
                        <div className="space-y-4 pt-4">
                            <label className="block text-sm font-semibold text-gray-700">Sharaxaada (Explanation)</label>
                            <textarea
                                placeholder="Sharax sababta jawaabtu ay u sax tahay..."
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none min-h-[80px]"
                                value={explanation}
                                onChange={e => setExplanation(e.target.value)}
                            />
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
                                        <span>Keydi Su&apos;aasha</span>
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

export default function NewQuestionPage() {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <span className="font-medium animate-pulse">Soo rarayaa...</span>
                </div>
            </DashboardLayout>
        }>
            <NewQuestionContent />
        </Suspense>
    );
}
