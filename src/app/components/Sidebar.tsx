"use client";

const SECTIONS = [
    { key: "categories", label: "Qaybaha", icon: "📂" },
    { key: "courses", label: "Koorsooyinka", icon: "📚" },
    { key: "lessons", label: "Casharada", icon: "📖" },
    { key: "problems", label: "Su'aalaha", icon: "❓" },
];

export default function Sidebar({ section, setSection }: { section: string; setSection: (s: string) => void }) {
    return (
        <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Logo section - only visible on desktop */}
            <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <img src="https://www.garaad.org/favicon.ico" alt="Garaad Logo" className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    Garaad Maamul
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-1.5">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.key}
                            className={`
                                group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium
                                transition-all duration-200 ease-in-out
                                ${section === s.key
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }
                            `}
                            onClick={() => setSection(s.key)}
                            title={s.label}
                        >
                            <span className={`
                                flex items-center justify-center w-9 h-9 rounded-lg
                                transition-all duration-200 ease-in-out
                                ${section === s.key
                                    ? "bg-white shadow-sm text-blue-600"
                                    : "bg-gray-50 text-gray-600 group-hover:bg-white group-hover:shadow-sm"
                                }
                            `}>
                                {s.icon}
                            </span>
                            <span className="flex-1">{s.label}</span>

                            {/* Active indicator */}
                            {section === s.key && (
                                <span className="absolute right-2 w-1.5 h-8 bg-blue-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all duration-200">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600">
                        👤
                    </span>
                    <span className="font-medium">Maamulaha</span>
                </div>
            </div>
        </div>
    );
} 