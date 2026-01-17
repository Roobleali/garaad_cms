"use client";

import DashboardLayout from "./components/DashboardLayout";
import Link from "next/link";

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
            Ku soo dhawoow Garaad Maamul
          </h1>
          <p className="text-gray-600 text-lg">
            Halkan waxaad ka maamuli kartaa dhammaan qaybaha Garaad. Dooro qayb si aad u bilowdo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard"
            className="group bg-blue-600 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-blue-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📊
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white transition-colors">
                  Dashboard
                </h2>
                <p className="text-blue-100 text-sm">Analytics</p>
              </div>
            </div>
            <p className="text-blue-50">
              Arag xogta guud ee platform-ka iyo analytics-ka
            </p>
          </Link>

          <Link
            href="/qaybaha"
            className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📂
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  Qaybaha
                </h2>
                <p className="text-gray-500 text-sm">Categories</p>
              </div>
            </div>
            <p className="text-gray-600">
              Maamul qaybaha waxbarasho ee Garaad
            </p>
          </Link>

          <Link
            href="/koorsooyinka"
            className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📚
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                  Koorsooyinka
                </h2>
                <p className="text-gray-500 text-sm">Courses</p>
              </div>
            </div>
            <p className="text-gray-600">
              Maamul koorsooyinka waxbarasho
            </p>
          </Link>

          <Link
            href="/casharada"
            className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📖
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                  Casharada
                </h2>
                <p className="text-gray-500 text-sm">Lessons</p>
              </div>
            </div>
            <p className="text-gray-600">
              Maamul casharada iyo qeybaha
            </p>
          </Link>

          <Link
            href="/sualaha"
            className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ❓
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors">
                  Su'aalaha
                </h2>
                <p className="text-gray-500 text-sm">Questions</p>
              </div>
            </div>
            <p className="text-gray-600">
              Maamul su'aalaha iyo dhibaatooyinka
            </p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
