'use client';

import React, { useState, useEffect } from 'react';
import { analyticsService, UserAnalytics, RevenueAnalytics, CourseAnalytics, RecentActivity } from '@/services/analytics';
import KPICard from '@/components/dashboard/KPICard';
import TrendChart from '@/components/dashboard/TrendChart';
import Link from 'next/link';
import { Users, DollarSign, TrendingUp, ShoppingCart, Award, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
    const [userStats, setUserStats] = useState<UserAnalytics | null>(null);
    const [revenueStats, setRevenueStats] = useState<RevenueAnalytics | null>(null);
    const [courseStats, setCourseStats] = useState<CourseAnalytics | null>(null);
    const [activityStats, setActivityStats] = useState<RecentActivity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [u, r, c, a] = await Promise.all([
                    analyticsService.getUsers(),
                    analyticsService.getRevenue(),
                    analyticsService.getCourses(),
                    analyticsService.getActivity()
                ]);
                setUserStats(u);
                setRevenueStats(r);
                setCourseStats(c);
                setActivityStats(a);
                setError(null);
            } catch (err) {
                console.error('Error fetching analytics data:', err);
                setError('Could not load analytics data. Please make sure the backend is running and you are logged in as an admin.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600 font-medium animate-pulse">
                        Soo raryaya dashboard-ka...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-3xl border-2 border-red-50 max-w-md text-center shadow-xl">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Khalad ayaa dhacay</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all"
                    >
                        Isku day markale
                    </button>
                </div>
            </div>
        );
    }

    if (!userStats || !revenueStats || !courseStats || !activityStats) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] mb-2 tracking-tight">
                        Analytics Dashboard
                    </h1>
                    <p className="text-[#64748b] font-medium">
                        Guud ahaan xaaladda platform-ka iyo qorshayaasha
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-[#e2e8f0] shadow-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-[#475569]">
                        Live Data
                    </span>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="WADARTA USERS-KA"
                    value={userStats.total}
                    change={userStats.change}
                    trend={userStats.change >= 0 ? "up" : "down"}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                />
                <KPICard
                    title="ACTIVE USERS (DAU)"
                    value={userStats.activeUsers.dau}
                    change={userStats.activeUsers.dauChange}
                    trend={userStats.activeUsers.dauChange >= 0 ? "up" : "down"}
                    icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                />
                <KPICard
                    title="DHAKHLIGA (REVENUE)"
                    value={revenueStats.total}
                    change={revenueStats.change}
                    trend={revenueStats.change >= 0 ? "up" : "down"}
                    prefix="$"
                    decimals={2}
                    icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
                />
                <KPICard
                    title="CONVERSION RATE"
                    value={revenueStats.conversionRate}
                    change={revenueStats.conversionChange}
                    trend={revenueStats.conversionChange >= 0 ? "up" : "down"}
                    suffix="%"
                    decimals={1}
                    icon={<ShoppingCart className="w-5 h-5 text-purple-600" />}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users Section - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Trends */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#e2e8f0] shadow-sm">
                        <h2 className="text-xl font-extrabold text-[#1e293b] mb-8 tracking-tight">User Trends (Todobaadkan)</h2>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-6 mb-10">
                            <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0]">
                                <div className="text-[10px] text-[#64748b] mb-1 font-bold uppercase tracking-[0.15em]">Maanta</div>
                                <div className="text-3xl font-black text-[#0f172a] tracking-tight">{userStats.newUsers.today}</div>
                                <div className="text-[9px] text-blue-600 font-extrabold uppercase mt-1">New Users</div>
                            </div>
                            <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0]">
                                <div className="text-[10px] text-[#64748b] mb-1 font-bold uppercase tracking-[0.15em]">Todobaadkan</div>
                                <div className="text-3xl font-black text-[#0f172a] tracking-tight">{userStats.newUsers.thisWeek}</div>
                                <div className="text-[9px] text-blue-600 font-extrabold uppercase mt-1">New Users</div>
                            </div>
                            <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0]">
                                <div className="text-[10px] text-[#64748b] mb-1 font-bold uppercase tracking-[0.15em]">Bishan</div>
                                <div className="text-3xl font-black text-[#0f172a] tracking-tight">{userStats.newUsers.thisMonth}</div>
                                <div className="text-[9px] text-blue-600 font-extrabold uppercase mt-1">New Users</div>
                            </div>
                        </div>

                        {/* Chart */}
                        <TrendChart
                            data={userStats.trends.labels.map((label, idx) => ({
                                day: label,
                                newUsers: userStats.trends.newUsers[idx],
                                activeUsers: userStats.trends.activeUsers[idx],
                            }))}
                            dataKeys={[
                                { key: 'newUsers', color: '#3B82F6', name: 'New Users' },
                                { key: 'activeUsers', color: '#10B981', name: 'Active Users' },
                            ]}
                            xAxisKey="day"
                            type="area"
                            height={300}
                            showLegend
                        />
                    </div>

                    {/* Revenue Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#e2e8f0] shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-extrabold text-[#1e293b] tracking-tight">Revenue Performance</h2>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">ARPU</div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">
                                        ${revenueStats.arpu.toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">CONVERSION</div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">
                                        {revenueStats.conversionRate}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Trend Chart */}
                        <TrendChart
                            data={revenueStats.trends.labels.map((label, idx) => ({
                                month: label,
                                revenue: revenueStats.trends.revenue[idx],
                            }))}
                            dataKeys={[{ key: 'revenue', color: '#10B981', name: 'Revenue' }]}
                            xAxisKey="month"
                            type="bar"
                            height={300}
                        />
                    </div>
                </div>

                {/* Sidebar - Takes 1 column */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#e2e8f0] shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-extrabold text-[#1e293b] tracking-tight">Recent Activity</h2>
                            <Link href="/users" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Recent Purchases */}
                        <div className="mb-8">
                            <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                Purchases
                            </h3>
                            <div className="space-y-4">
                                {activityStats.purchases.length > 0 ? activityStats.purchases.slice(0, 5).map((purchase, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <DollarSign className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-[#1e293b] truncate">
                                                {purchase.userName}
                                            </div>
                                            <div className="text-[11px] text-[#64748b] truncate font-semibold">
                                                {purchase.course} • <span className="text-emerald-600 font-extrabold">${purchase.amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-400 text-center py-4 italic">No recent purchases</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Signups */}
                        <div>
                            <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                                New Signups
                            </h3>
                            <div className="space-y-4">
                                {activityStats.signups.length > 0 ? activityStats.signups.slice(0, 5).map((signup, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-black text-blue-600">
                                            {signup.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-[#1e293b]">
                                                {signup.userName}
                                            </div>
                                            <div className="text-[9px] text-[#94a3b8] font-black uppercase tracking-wider">
                                                {new Date(signup.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-400 text-center py-4 italic">No recent signups</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Courses */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#e2e8f0] shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-extrabold text-[#1e293b] tracking-tight">Top Courses</h2>
                            <Link href="/koorsooyinka" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                Manage <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {courseStats.topCourses.length > 0 ? courseStats.topCourses.slice(0, 5).map((course, idx) => (
                                <div key={course.id} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-[#0f172a] flex items-center justify-center text-sm font-black text-white shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-black text-[#1e293b] truncate">
                                            {course.title}
                                        </div>
                                        <div className="text-[9px] text-[#64748b] font-extrabold uppercase flex items-center gap-2 tracking-wide">
                                            <span>{course.enrollments} ENROLLED</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                            <span className="text-emerald-600">{course.completionRate}% DONE</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                        <Award className="w-3 h-3 text-yellow-600" />
                                        <span className="text-xs font-black text-yellow-700 dark:text-yellow-500">
                                            {course.avgRating}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 text-center py-4 italic">No course data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Drop-off Points */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#e2e8f0] shadow-sm">
                        <h2 className="text-xl font-extrabold text-[#1e293b] mb-8 tracking-tight">Attention Needed</h2>
                        <div className="space-y-4">
                            {courseStats.dropOffPoints.length > 0 ? courseStats.dropOffPoints.map((point, idx) => (
                                <div key={idx} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-gray-900 dark:text-white leading-tight mb-1">
                                                {point.lessonTitle}
                                            </div>
                                            <div className="text-[10px] text-red-600 font-black uppercase tracking-tight">
                                                {point.dropOffRate}% DROP-OFF RATE
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                                                {point.courseTitle}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center bg-gray-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">All smooth!</h3>
                                    <p className="text-xs text-gray-500">No major drop-off points detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);
