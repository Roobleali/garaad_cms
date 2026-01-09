"use client";

import { useState, useEffect } from "react";
import { api, ApiError, ApiResponse } from "./api";
import { useAuthStore } from "../store/auth";
import DashboardLayout from "./components/DashboardLayout";
import Questions from "./components/Questions";
import LessonContentBlocks from "./components/LessonContentBlocks";
import { Modal } from "./components/ui/Modal";

interface ApiErrorResponse {
  detail?: string;
  title?: string[];
  slug?: string[];
  [key: string]: unknown;
}

interface Category {
  id: number;
  title: string;
  description: string;
  image?: string;
  sequence: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  category: number | null;
  is_published: boolean;
  order?: number;
  sequence?: number;
  tags?: string[];
}

interface ContentBlock {
  id: number;
  type: string;
  content: string;
  order: number;
  lesson: number;
}

interface Lesson {
  id: number;
  title: string;
  slug: string;
  course: number | null;
  lesson_number: number | null;
  estimated_time: number | null;
  is_published: boolean;
  content_blocks: ContentBlock[];
  created_at: string;
  updated_at: string;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const styles = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles.fadeIn;
  document.head.appendChild(styleSheet);
}

export default function HomePage() {
  const [section, setSection] = useState("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSequence, setNewSequence] = useState(0);
  const [createError, setCreateError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editing, setEditing] = useState(false);
  const [editSequence, setEditSequence] = useState(0);
  const [editError, setEditError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseImage, setNewCourseImage] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState<string | null>(null);
  const [newCourseSequence, setNewCourseSequence] = useState(0);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [createCourseError, setCreateCourseError] = useState("");
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseDescription, setEditCourseDescription] = useState("");
  const [editCourseImage, setEditCourseImage] = useState("");
  const [editCourseCategory, setEditCourseCategory] = useState<string | null>(null);
  const [editCourseSequence, setEditCourseSequence] = useState(0);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editCourseError, setEditCourseError] = useState("");
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);
  const [deleteCategoryError, setDeleteCategoryError] = useState("");
  const [showDeleteCourse, setShowDeleteCourse] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deletingCourseLoading, setDeletingCourseLoading] = useState(false);
  const [deleteCourseError, setDeleteCourseError] = useState("");
  const [newCourseIsPublished, setNewCourseIsPublished] = useState(false);
  const [editCourseIsPublished, setEditCourseIsPublished] = useState(false);

  // Lesson states
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonSearch, setLessonSearch] = useState("");
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonCourse, setNewLessonCourse] = useState<number | null>(null);
  const [newLessonNumber, setNewLessonNumber] = useState<number | null>(null);
  const [newLessonTime, setNewLessonTime] = useState<number | null>(null);
  const [newLessonIsPublished, setNewLessonIsPublished] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [createLessonError, setCreateLessonError] = useState("");

  const [showEditLesson, setShowEditLesson] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonCourse, setEditLessonCourse] = useState<number | null>(null);
  const [editLessonNumber, setEditLessonNumber] = useState<number | null>(null);
  const [editLessonTime, setEditLessonTime] = useState<number | null>(null);
  const [editLessonIsPublished, setEditLessonIsPublished] = useState(false);
  const [editingLesson, setEditingLesson] = useState(false);
  const [editLessonError, setEditLessonError] = useState("");

  const [showDeleteLesson, setShowDeleteLesson] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [deletingLessonLoading, setDeletingLessonLoading] = useState(false);
  const [deleteLessonError, setDeleteLessonError] = useState("");

  // Add pagination state for lessons
  const [lessonsPage, setLessonsPage] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);

  // Add state for content blocks management
  const [showContentBlocks, setShowContentBlocks] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Add state for modal management
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Helper function to close all modals
  const closeAllModals = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowDeleteCategory(false);
    setShowCreateCourse(false);
    setShowEditCourse(false);
    setShowDeleteCourse(false);
    setShowCreateLesson(false);
    setShowEditLesson(false);
    setShowDeleteLesson(false);
    setShowContentBlocks(false);
    setActiveModal(null);
  };

  // Helper function to open a modal
  const openModal = (modalName: string) => {
    closeAllModals();
    setActiveModal(modalName);
    switch (modalName) {
      case 'create':
        setShowCreate(true);
        break;
      case 'edit':
        setShowEdit(true);
        break;
      case 'deleteCategory':
        setShowDeleteCategory(true);
        break;
      case 'createCourse':
        setShowCreateCourse(true);
        break;
      case 'editCourse':
        setShowEditCourse(true);
        break;
      case 'deleteCourse':
        setShowDeleteCourse(true);
        break;
      case 'createLesson':
        setShowCreateLesson(true);
        break;
      case 'editLesson':
        setShowEditLesson(true);
        break;
      case 'deleteLesson':
        setShowDeleteLesson(true);
        break;
      case 'contentBlocks':
        setShowContentBlocks(true);
        break;
    }
  };

  // Debug effect for section changes
  useEffect(() => {
    console.log("Current section:", section);
  }, [section]);

  // Debug effect for lessons data
  useEffect(() => {
    if (section === "lessons") {
      console.log("Lessons data:", { loading, lessons });
    }
  }, [section, loading, lessons]);

  useEffect(() => {
    if (section === "categories") {
      setLoading(true);
      api.get("lms/categories/").then((res: ApiResponse<Category[]>) => {
        setCategories(res.data.sort((a, b) => a.sequence - b.sequence));
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
    }
    if (section === "courses" || section === "lessons") {
      setLoading(true);
      api.get("lms/courses/").then((res: ApiResponse<Course[]>) => {
        setCourses(res.data);
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      });
    }
    if (section === "lessons") {
      console.log("Fetching lessons...");
      setLoading(true);
      api.get(`lms/lessons/?page=${lessonsPage}`).then((res: ApiResponse<Lesson[]>) => {
        console.log("Lessons API response:", res);
        if (res.data && Array.isArray(res.data)) {
          setLessons(res.data);
          setTotalLessons(res.data.length);
        } else {
          console.error("Invalid lessons data format:", res.data);
          setLessons([]);
          setTotalLessons(0);
        }
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching lessons:", error);
        setLessons([]);
        setTotalLessons(0);
        setLoading(false);
      });
    }
  }, [section, lessonsPage]);

  // Add this useEffect to log lessons state changes
  useEffect(() => {
    console.log("Current lessons state:", lessons);
  }, [lessons]);

  // Add this useEffect to reset page when section changes
  useEffect(() => {
    setLessonsPage(1);
  }, [section]);

  // Handler functions for categories
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    // Generate a random unique ID not in use
    const existingIds = categories.map(cat => cat.id);
    let newId;
    do {
      newId = Math.floor(Math.random() * 1000000) + 1; // 1 to 1,000,000
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
      closeAllModals();
    } catch (err: unknown) {
      console.error("Error creating category:", err);
      const apiError = err as ApiError;
      if (apiError.response) {
        const errorDetail = apiError.response.data?.detail || apiError.response.data?.message || apiError.message;
        setCreateError(errorDetail || "Qayb lama sameyn karin");
      } else {
        setCreateError(apiError.message || "Qayb lama sameyn karin");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
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
      closeAllModals();
    } catch (err: unknown) {
      console.error("Error updating category:", err);
      const apiError = err as ApiError;
      if (apiError.response) {
        const errorDetail = apiError.response.data?.detail || apiError.response.data?.message || apiError.message;
        setEditError(errorDetail || "Qayb lama beddeli karin");
      } else {
        setEditError(apiError.message || "Qayb lama beddeli karin");
      }
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    setDeletingCategoryLoading(true);
    setDeleteCategoryError("");

    try {
      await api.delete(`lms/categories/${deletingCategory.id}/`);
      setCategories(categories.filter(cat => cat.id !== deletingCategory.id));
      closeAllModals();
    } catch (err: unknown) {
      console.error("Error deleting category:", err);
      const apiError = err as ApiError;
      if (apiError.response) {
        const errorDetail = apiError.response.data?.detail || apiError.response.data?.message || apiError.message;
        setDeleteCategoryError(errorDetail || "Qayb lama tiri karin");
      } else {
        setDeleteCategoryError(apiError.message || "Qayb lama tiri karin");
      }
    } finally {
      setDeletingCategoryLoading(false);
    }
  };

  // Handler functions for courses
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCourse(true);
    setCreateCourseError("");

    try {
      const res = await api.post("lms/courses/", {
        title: newCourseTitle,
        description: newCourseDescription,
        thumbnail: newCourseImage || null,
        category: newCourseCategory,
        sequence: newCourseSequence,
        is_published: newCourseIsPublished,
        author_id: 1  // Default author_id for Garaad
      });

      setCourses([...courses, res.data]);
      setNewCourseTitle("");
      setNewCourseDescription("");
      setNewCourseImage("");
      setNewCourseCategory(null);
      setNewCourseSequence(0);
      setNewCourseIsPublished(false);
      closeAllModals();
    } catch (err: unknown) {
      console.error("Error creating course:", err);
      const apiError = err as ApiError;
      if (apiError.response) {
        const errorDetail = apiError.response.data?.detail || apiError.response.data?.message || apiError.message;
        setCreateCourseError(errorDetail || "Koorso lama sameyn karin");
      } else {
        setCreateCourseError(apiError.message || "Koorso lama sameyn karin");
      }
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;

    setEditingCourse(true);
    setEditCourseError("");

    try {
      const res = await api.patch(`lms/courses/${editCourse.id}/`, {
        title: editCourseTitle,
        description: editCourseDescription,
        thumbnail: editCourseImage || null,
        category: editCourseCategory,
        sequence: editCourseSequence,
        is_published: editCourseIsPublished
      });

      setCourses(courses.map(course => course.id === editCourse.id ? res.data : course));
      closeAllModals();
    } catch (err: unknown) {
      console.error("Error updating course:", err);
      const apiError = err as ApiError;
      if (apiError.response) {
        const errorDetail = apiError.response.data?.detail || apiError.response.data?.message || apiError.message;
        setEditCourseError(errorDetail || "Koorso lama beddeli karin");
      } else {
        setEditCourseError(apiError.message || "Koorso lama beddeli karin");
      }
    } finally {
      setEditingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;

    setDeletingCourseLoading(true);
    setDeleteCourseError("");

    try {
      await api.delete(`lms/courses/${deletingCourse.id}/`);
      setCourses(courses.filter(course => course.id !== deletingCourse.id));
      closeAllModals();
    } catch (err: unknown) {
      console.error("Error deleting course:", err);
      const apiError = err as ApiError;
      if (apiError.response) {
        const errorDetail = apiError.response.data?.detail || apiError.response.data?.message || apiError.message;
        setDeleteCourseError(errorDetail || "Koorso lama tiri karin");
      } else {
        setDeleteCourseError(apiError.message || "Koorso lama tiri karin");
      }
    } finally {
      setDeletingCourseLoading(false);
    }
  };

  return (
    <DashboardLayout section={section} setSection={setSection}>
      <div className="animate-fade-in space-y-6">
        {section === "categories" && (
          <div className="w-full">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                Ku soo dhawoow Garaad Maamul
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
                onClick={() => openModal('create')}
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
                {categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase())).map(cat => (
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
                              openModal('edit');
                            }}
                          >
                            Wax ka beddel
                          </button>
                          <button
                            className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                            onClick={() => {
                              setDeletingCategory(cat);
                              openModal('deleteCategory');
                            }}
                          >
                            Tir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
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
          </div>
        )}
        {section === "courses" && (
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-2 text-blue-800">Koorsooyinka</h1>
            <p className="mb-6 text-gray-600">Halkan waxaad ka maamuli kartaa koorsooyinka. Dooro ama raadso koorso si aad u bilowdo.</p>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                placeholder="Raadi koorso..."
                className="flex-1 border rounded px-4 py-2 text-gray-900 placeholder-gray-400"
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => openModal('createCourse')}
              >
                + Koorso cusub
              </button>
            </div>
            {loading ? (
              <div className="text-center text-gray-500">Soo loading...</div>
            ) : (
              <div className="space-y-2">
                {courses.filter(course => course.title.toLowerCase().includes(courseSearch.toLowerCase())).map(course => (
                  <div key={course.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg text-blue-700">{course.title}</div>
                      <div className="text-gray-500 text-sm">{course.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-10 h-10 rounded object-cover ml-4" />}
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-sm"
                          onClick={() => {
                            setEditCourse(course);
                            setEditCourseTitle(course.title);
                            setEditCourseDescription(course.description);
                            setEditCourseImage(course.thumbnail || "");
                            setEditCourseCategory(course.category ? String(course.category) : null);
                            setEditCourseSequence(course.sequence || 0);
                            setEditCourseIsPublished(course.is_published);
                            openModal('editCourse');
                          }}
                        >
                          Wax ka beddel
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 text-sm"
                          onClick={() => {
                            setDeletingCourse(course);
                            openModal('deleteCourse');
                          }}
                        >
                          Tir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && <div className="text-gray-400 text-center">Koorsooyin lama helin.</div>}
              </div>
            )}
          </div>
        )}
        {section === "lessons" && (
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-2 text-blue-800">Casharada</h1>
            <p className="mb-6 text-gray-600">Halkan waxaad ka maamuli kartaa casharada. Dooro ama raadso cashar si aad u bilowdo.</p>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                placeholder="Raadi cashar..."
                className="flex-1 border rounded px-4 py-2 text-gray-900 placeholder-gray-400"
                value={lessonSearch}
                onChange={e => setLessonSearch(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => openModal('createLesson')}
              >
                + Cashar cusub
              </button>
            </div>
            {loading ? (
              <div className="text-center text-gray-500">Soo loading...</div>
            ) : (
              <>
                <div className="space-y-2">
                  {Array.isArray(lessons) && lessons.length > 0 ? (
                    lessons
                      .filter(lesson => lesson.title.toLowerCase().includes(lessonSearch.toLowerCase()))
                      .map(lesson => (
                        <div key={lesson.id} className="p-4 bg-white rounded shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg text-blue-700">{lesson.title}</div>
                              <div className="text-gray-500 text-sm space-y-1">
                                <div>Koorso: {courses.find(c => c.id === lesson.course)?.title || 'Ma jiro'}</div>
                                <div>Lambarka cashar: {lesson.lesson_number || 'Ma jiro'}</div>
                                <div>Waqtiga qiyaasta ah: {lesson.estimated_time ? `${lesson.estimated_time} daqiiqo` : 'Ma jiro'}</div>
                                <div>Xaalada: {lesson.is_published ? 'Daabacan' : 'Daabac ma&apos;ahan'}</div>
                                <div>Qeybaha: {lesson.content_blocks.length}</div>
                                <div className="text-xs text-gray-400">
                                  La abuuray: {new Date(lesson.created_at).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400">
                                  La cusbooneysiiyay: {new Date(lesson.updated_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm"
                                onClick={() => {
                                  setSelectedLesson(lesson);
                                  openModal('contentBlocks');
                                }}
                              >
                                Qeybaha
                              </button>
                              <button
                                className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-sm"
                                onClick={() => {
                                  setEditLesson(lesson);
                                  setEditLessonTitle(lesson.title);
                                  setEditLessonCourse(lesson.course);
                                  setEditLessonNumber(lesson.lesson_number);
                                  setEditLessonTime(lesson.estimated_time);
                                  setEditLessonIsPublished(lesson.is_published);
                                  openModal('editLesson');
                                }}
                              >
                                Wax ka beddel
                              </button>
                              <button
                                className="px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 text-sm"
                                onClick={() => {
                                  setDeletingLesson(lesson);
                                  openModal('deleteLesson');
                                }}
                              >
                                Tir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-gray-400 text-center">Cashar lama helin.</div>
                  )}
                </div>
                {totalLessons > 0 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <button
                      className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => setLessonsPage(prev => Math.max(1, prev - 1))}
                      disabled={lessonsPage === 1}
                    >
                      Ka hor
                    </button>
                    <span className="px-4 py-2">
                      Bogga {lessonsPage} ee {Math.ceil(totalLessons / 10)}
                    </span>
                    <button
                      className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => setLessonsPage(prev => prev + 1)}
                      disabled={lessonsPage >= Math.ceil(totalLessons / 10)}
                    >
                      Ku xiga
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {section === "problems" && <Questions />}

        {/* Modal Container */}
        {activeModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAllModals} />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-100 opacity-100">
                {/* Create Category Modal */}
                {showCreate && (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                          Qayb cusub
                        </h2>
                        <p className="text-gray-600 mt-1">Buuxi macluumaadka qaybta cusub</p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                        onClick={closeAllModals}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleCreateCategory} className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Magaca
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Sharaxaad
                        </label>
                        <textarea
                          id="description"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                          Sawir URL (Optional)
                        </label>
                        <input
                          type="text"
                          id="image"
                          value={newImage}
                          onChange={(e) => setNewImage(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="sequence" className="block text-sm font-medium text-gray-700 mb-1">
                          Sequence (Sida ay isugu xigayaan)
                        </label>
                        <input
                          type="number"
                          id="sequence"
                          value={newSequence}
                          onChange={(e) => setNewSequence(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      {createError && (
                        <p className="text-sm text-red-600">{createError}</p>
                      )}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeAllModals}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Jooji
                        </button>
                        <button
                          type="submit"
                          disabled={creating}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {creating ? 'Kaydinaya...' : 'Kaydi'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Category Modal */}
                {showEdit && editCategory && (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                          Wax ka beddel Qaybta
                        </h2>
                        <p className="text-gray-600 mt-1">Wax ka beddel macluumaadka qaybta</p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                        onClick={closeAllModals}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleEditCategory} className="space-y-6">
                      <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Magaca
                        </label>
                        <input
                          type="text"
                          id="edit-title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Sharaxaad
                        </label>
                        <textarea
                          id="edit-description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 mb-1">
                          Sawir URL (Optional)
                        </label>
                        <input
                          type="text"
                          id="edit-image"
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-sequence" className="block text-sm font-medium text-gray-700 mb-1">
                          Sequence (Sida ay isugu xigayaan)
                        </label>
                        <input
                          type="number"
                          id="edit-sequence"
                          value={editSequence}
                          onChange={(e) => setEditSequence(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      {editError && (
                        <p className="text-sm text-red-600">{editError}</p>
                      )}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeAllModals}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Jooji
                        </button>
                        <button
                          type="submit"
                          disabled={editing}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {editing ? 'Kaydinaya...' : 'Kaydi'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Delete Category Modal */}
                {showDeleteCategory && deletingCategory && (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-red-600">
                          Tir Qaybta
                        </h2>
                        <p className="text-gray-600 mt-1">Ma hubtaa inaad tirto qaybtan?</p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                        onClick={closeAllModals}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                      <p className="text-red-800">
                        Tani waa mid aan la soo celin karin. Dhammaan koorsooyinka iyo casharrada ku jira qaybtan ayaa la tiri doonaa.
                      </p>
                    </div>
                    {deleteCategoryError && (
                      <p className="text-sm text-red-600 mb-6">{deleteCategoryError}</p>
                    )}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeAllModals}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Maya
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteCategory}
                        disabled={deletingCategoryLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingCategoryLoading ? 'Tirinaya...' : 'Haa, Tir'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Create Course Modal */}
                {showCreateCourse && (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                          Koorso cusub
                        </h2>
                        <p className="text-gray-600 mt-1">Buuxi macluumaadka koorso cusub</p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                        onClick={closeAllModals}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleCreateCourse} className="space-y-6">
                      <div>
                        <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Magaca
                        </label>
                        <input
                          type="text"
                          id="course-title"
                          value={newCourseTitle}
                          onChange={(e) => setNewCourseTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Sharaxaad
                        </label>
                        <textarea
                          id="course-description"
                          value={newCourseDescription}
                          onChange={(e) => setNewCourseDescription(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="course-category" className="block text-sm font-medium text-gray-700 mb-1">
                          Qayb
                        </label>
                        <select
                          id="course-category"
                          value={newCourseCategory || ""}
                          onChange={(e) => setNewCourseCategory(e.target.value || null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Dooro qayb</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="course-image" className="block text-sm font-medium text-gray-700 mb-1">
                          Sawir URL (Optional)
                        </label>
                        <input
                          type="text"
                          id="course-image"
                          value={newCourseImage}
                          onChange={(e) => setNewCourseImage(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="course-sequence" className="block text-sm font-medium text-gray-700 mb-1">
                          Sequence (Lambarka dhismaha)
                        </label>
                        <input
                          type="number"
                          id="course-sequence"
                          value={newCourseSequence}
                          onChange={(e) => setNewCourseSequence(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="course-published"
                          checked={newCourseIsPublished}
                          onChange={(e) => setNewCourseIsPublished(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="course-published" className="ml-2 block text-sm text-gray-900">
                          Daabac
                        </label>
                      </div>
                      {createCourseError && (
                        <p className="text-sm text-red-600">{createCourseError}</p>
                      )}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeAllModals}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Jooji
                        </button>
                        <button
                          type="submit"
                          disabled={creatingCourse}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {creatingCourse ? 'Kaydinaya...' : 'Kaydi'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Course Modal */}
                {showEditCourse && editCourse && (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                          Wax ka beddel Koorsada
                        </h2>
                        <p className="text-gray-600 mt-1">Wax ka beddel macluumaadka koorsada</p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                        onClick={closeAllModals}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleEditCourse} className="space-y-6">
                      <div>
                        <label htmlFor="edit-course-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Magaca
                        </label>
                        <input
                          type="text"
                          id="edit-course-title"
                          value={editCourseTitle}
                          onChange={(e) => setEditCourseTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-course-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Sharaxaad
                        </label>
                        <textarea
                          id="edit-course-description"
                          value={editCourseDescription}
                          onChange={(e) => setEditCourseDescription(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-course-category" className="block text-sm font-medium text-gray-700 mb-1">
                          Qayb
                        </label>
                        <select
                          id="edit-course-category"
                          value={editCourseCategory || ""}
                          onChange={(e) => setEditCourseCategory(e.target.value || null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Dooro qayb</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="edit-course-image" className="block text-sm font-medium text-gray-700 mb-1">
                          Sawir URL (Optional)
                        </label>
                        <input
                          type="text"
                          id="edit-course-image"
                          value={editCourseImage}
                          onChange={(e) => setEditCourseImage(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-course-sequence" className="block text-sm font-medium text-gray-700 mb-1">
                          Sequence (Lambarka dhismaha)
                        </label>
                        <input
                          type="number"
                          id="edit-course-sequence"
                          value={editCourseSequence}
                          onChange={(e) => setEditCourseSequence(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit-course-published"
                          checked={editCourseIsPublished}
                          onChange={(e) => setEditCourseIsPublished(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="edit-course-published" className="ml-2 block text-sm text-gray-900">
                          Daabac
                        </label>
                      </div>
                      {editCourseError && (
                        <p className="text-sm text-red-600">{editCourseError}</p>
                      )}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeAllModals}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Jooji
                        </button>
                        <button
                          type="submit"
                          disabled={editingCourse}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {editingCourse ? 'Kaydinaya...' : 'Kaydi'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Delete Course Modal */}
                {showDeleteCourse && deletingCourse && (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-red-600">
                          Tir Koorsada
                        </h2>
                        <p className="text-gray-600 mt-1">Ma hubtaa inaad tirto koorsodan?</p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                        onClick={closeAllModals}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                      <p className="text-red-800">
                        Tani waa mid aan la soo celin karin. Dhammaan casharrada ku jira koorsodan ayaa la tiri doonaa.
                      </p>
                    </div>
                    {deleteCourseError && (
                      <p className="text-sm text-red-600 mb-6">{deleteCourseError}</p>
                    )}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeAllModals}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Maya
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteCourse}
                        disabled={deletingCourseLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingCourseLoading ? 'Tirinaya...' : 'Haa, Tir'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Blocks Modal */}
                {showContentBlocks && selectedLesson && (
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                          Qeybaha Casharrada
                        </h2>
                        <p className="text-gray-600 mt-1">{selectedLesson.title}</p>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                        onClick={closeAllModals}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <LessonContentBlocks
                      lessonId={selectedLesson.id}
                      onUpdate={() => {
                        api.get(`lms/lessons/?page=${lessonsPage}`).then((res: ApiResponse<Lesson[]>) => {
                          if (res.data && Array.isArray(res.data)) {
                            setLessons(res.data);
                            setTotalLessons(res.data.length);
                          }
                        });
                      }}
                    />
                  </div>
                )}

                {/* Create Lesson Modal */}
                <Modal
                  isOpen={showCreateLesson}
                  onClose={() => {
                    setShowCreateLesson(false);
                    setNewLessonTitle("");
                    setNewLessonCourse(null);
                    setNewLessonNumber(null);
                    setNewLessonTime(null);
                    setNewLessonIsPublished(false);
                    setCreateLessonError("");
                  }}
                  title="Cashar cusub"
                >
                  <div className="p-6">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        setCreatingLesson(true);
                        setCreateLessonError("");

                        const response = await api.post("lms/lessons/", {
                          title: newLessonTitle,
                          slug: generateSlug(newLessonTitle),
                          course: newLessonCourse,
                          lesson_number: newLessonNumber,
                          estimated_time: newLessonTime,
                          is_published: newLessonIsPublished
                        });

                        if (response.data) {
                          setLessons([...lessons, response.data]);
                          closeAllModals();
                        }
                      } catch (error) {
                        const apiError = error as ApiError;
                        const errorResponse = apiError.response?.data as ApiErrorResponse;
                        setCreateLessonError(
                          errorResponse?.detail ||
                          errorResponse?.title?.[0] ||
                          errorResponse?.slug?.[0] ||
                          "Khalad ayaa dhacay"
                        );
                      } finally {
                        setCreatingLesson(false);
                      }
                    }} className="space-y-6">
                      <div>
                        <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Magaca
                        </label>
                        <input
                          type="text"
                          id="lesson-title"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="lesson-course" className="block text-sm font-medium text-gray-700 mb-1">
                          Koorso
                        </label>
                        <select
                          id="lesson-course"
                          value={newLessonCourse || ""}
                          onChange={(e) => setNewLessonCourse(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Dooro koorso</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="lesson-number" className="block text-sm font-medium text-gray-700 mb-1">
                          Lambarka casharrada
                        </label>
                        <input
                          type="number"
                          id="lesson-number"
                          value={newLessonNumber || ""}
                          onChange={(e) => setNewLessonNumber(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="lesson-time" className="block text-sm font-medium text-gray-700 mb-1">
                          Waqtiga qiyaasta ah (daqiiqo)
                        </label>
                        <input
                          type="number"
                          id="lesson-time"
                          value={newLessonTime || ""}
                          onChange={(e) => setNewLessonTime(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          required
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="lesson-published"
                          checked={newLessonIsPublished}
                          onChange={(e) => setNewLessonIsPublished(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="lesson-published" className="ml-2 block text-sm text-gray-900">
                          Daabac
                        </label>
                      </div>

                      {createLessonError && (
                        <p className="text-sm text-red-600">{createLessonError}</p>
                      )}

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateLesson(false);
                            setNewLessonTitle("");
                            setNewLessonCourse(null);
                            setNewLessonNumber(null);
                            setNewLessonTime(null);
                            setNewLessonIsPublished(false);
                            setCreateLessonError("");
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={creatingLesson}
                        >
                          Ka noqo
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={creatingLesson}
                        >
                          {creatingLesson ? "La abuurayaa..." : "Abuur"}
                        </button>
                      </div>
                    </form>
                  </div>
                </Modal>

                {/* Edit Lesson Modal */}
                <Modal
                  isOpen={showEditLesson}
                  onClose={() => {
                    setShowEditLesson(false);
                    setEditLesson(null);
                    setEditLessonTitle("");
                    setEditLessonCourse(null);
                    setEditLessonNumber(null);
                    setEditLessonTime(null);
                    setEditLessonIsPublished(false);
                    setEditLessonError("");
                  }}
                  title="Wax ka beddel Cashar"
                >
                  <div className="p-6">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        setEditingLesson(true);
                        setEditLessonError("");

                        const response = await api.patch(`lms/lessons/${editLesson?.id}/`, {
                          title: editLessonTitle,
                          slug: generateSlug(editLessonTitle),
                          course: editLessonCourse,
                          lesson_number: editLessonNumber,
                          estimated_time: editLessonTime,
                          is_published: editLessonIsPublished
                        });

                        if (response.data) {
                          setLessons(prevLessons =>
                            prevLessons.map(lesson =>
                              lesson.id === editLesson?.id ? response.data : lesson
                            )
                          );
                          setShowEditLesson(false);
                          setEditLesson(null);
                          setEditLessonTitle("");
                          setEditLessonCourse(null);
                          setEditLessonNumber(null);
                          setEditLessonTime(null);
                          setEditLessonIsPublished(false);
                        }
                      } catch (error) {
                        const apiError = error as ApiError;
                        const errorResponse = apiError.response?.data as ApiErrorResponse;
                        setEditLessonError(
                          errorResponse?.detail ||
                          errorResponse?.title?.[0] ||
                          errorResponse?.slug?.[0] ||
                          "Khalad ayaa dhacay"
                        );
                      } finally {
                        setEditingLesson(false);
                      }
                    }}>
                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="edit-lesson-title"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Magaca
                          </label>
                          <input
                            type="text"
                            id="edit-lesson-title"
                            value={editLessonTitle}
                            onChange={(e) => setEditLessonTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="edit-lesson-course"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Koorso
                          </label>
                          <select
                            id="edit-lesson-course"
                            value={editLessonCourse || ""}
                            onChange={(e) => setEditLessonCourse(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Dooro koorso</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="edit-lesson-number"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Lambarka casharrada
                          </label>
                          <input
                            type="number"
                            id="edit-lesson-number"
                            value={editLessonNumber || ""}
                            onChange={(e) => setEditLessonNumber(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="edit-lesson-time"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Waqtiga qiyaasta ah (daqiiqo)
                          </label>
                          <input
                            type="number"
                            id="edit-lesson-time"
                            value={editLessonTime || ""}
                            onChange={(e) => setEditLessonTime(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            required
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="edit-lesson-published"
                            checked={editLessonIsPublished}
                            onChange={(e) => setEditLessonIsPublished(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="edit-lesson-published"
                            className="ml-2 block text-sm text-gray-900"
                          >
                            Daabac
                          </label>
                        </div>

                        {editLessonError && (
                          <p className="text-sm text-red-600">{editLessonError}</p>
                        )}

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditLesson(false);
                              setEditLesson(null);
                              setEditLessonTitle("");
                              setEditLessonCourse(null);
                              setEditLessonNumber(null);
                              setEditLessonTime(null);
                              setEditLessonIsPublished(false);
                              setEditLessonError("");
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={editingLesson}
                          >
                            Ka noqo
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={editingLesson}
                          >
                            {editingLesson ? "La bedelayaa..." : "Badel"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </Modal>

                {/* Delete Lesson Modal */}
                <Modal
                  isOpen={showDeleteLesson && !!deletingLesson}
                  onClose={() => {
                    setShowDeleteLesson(false);
                    setDeletingLesson(null);
                    setDeleteLessonError("");
                  }}
                  title="Tir Cashar"
                >
                  <div className="p-6">
                    <p className="text-gray-700 mb-6">
                      Ma hubtaa inaad tirto casharkan? Tani waa mid aan la soo celin karin.
                    </p>

                    {deleteLessonError && (
                      <p className="text-sm text-red-600 mb-4">{deleteLessonError}</p>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteLesson(false);
                          setDeletingLesson(null);
                          setDeleteLessonError("");
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={deletingLessonLoading}
                      >
                        Maya
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!deletingLesson) return;
                          try {
                            setDeletingLessonLoading(true);
                            setDeleteLessonError("");

                            await api.delete(`lms/lessons/${deletingLesson.id}/`);

                            setLessons(prevLessons =>
                              prevLessons.filter(lesson => lesson.id !== deletingLesson.id)
                            );
                            setShowDeleteLesson(false);
                            setDeletingLesson(null);
                          } catch (error) {
                            const apiError = error as ApiError;
                            const errorResponse = apiError.response?.data as ApiErrorResponse;
                            setDeleteLessonError(
                              errorResponse?.detail ||
                              "Khalad ayaa dhacay markii la tirayay casharkan"
                            );
                          } finally {
                            setDeletingLessonLoading(false);
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={deletingLessonLoading}
                      >
                        {deletingLessonLoading ? "La tirayaa..." : "Haa, Tir"}
                      </button>
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
          </div>
        )}

        {/* Global styles for animations */}
        <style jsx global>{`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes modalBackdropFadeIn {
            from {
              opacity: 0;
              backdrop-filter: blur(0);
            }
            to {
              opacity: 1;
              backdrop-filter: blur(4px);
            }
          }

          .modal-content {
            animation: modalFadeIn 0.3s ease-out forwards;
          }

          .modal-backdrop {
            animation: modalBackdropFadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
