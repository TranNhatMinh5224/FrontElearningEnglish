import React, { useEffect, useState } from "react";
import { MdTrendingUp, MdPeople, MdAttachMoney, MdSchool, MdPersonAdd } from "react-icons/md";
import { adminService } from "../../../Services/adminService";
import DashboardHeader from "../../../Components/Admin/Dashboard/DashboardHeader/DashboardHeader";
import KPICard from "../../../Components/Admin/Dashboard/KPICard/KPICard";
import RevenueChart from "../../../Components/Admin/Dashboard/RevenueChart/RevenueChart";
import UserDistributionChart from "../../../Components/Admin/Dashboard/UserDistributionChart/UserDistributionChart";
import RevenueBreakdown from "../../../Components/Admin/Dashboard/RevenueBreakdown/RevenueBreakdown";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  // Initial State (Empty)
  const [overview, setOverview] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    newUsersLast30Days: 0, // Updated key name from backend DTO
    newUsersToday: 0
  });
  
  const [revenueChartData, setRevenueChartData] = useState([]);
  
  const [userStats, setUserStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    activeUsers: 0, // Updated key name
    blockedUsers: 0 // Updated key name
  });

  const [revenueBreakdown, setRevenueBreakdown] = useState({
    fromCourses: 0,
    fromPackages: 0
  });

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, chartRes, userRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRevenueChart(timeRange),
          adminService.getUserStats()
      ]);

      // 1. Overview Data
      if (overviewRes.data?.success) {
        setOverview(overviewRes.data.data);
      }

      // 2. Revenue Chart Data & Breakdown
      if (chartRes.data?.success) {
        const chartDto = chartRes.data.data;
        
        if (chartDto) {
            // Real breakdown data from API
            setRevenueBreakdown({
                fromCourses: chartDto.courseRevenue || 0,
                fromPackages: chartDto.teacherPackageRevenue || 0
            });

            // Merge daily arrays for visualization
            const courses = chartDto.dailyCourseRevenue || [];
            const packages = chartDto.dailyTeacherPackageRevenue || [];
            
            // Safe merge logic assuming backend returns aligned dates
            const mergedChartData = courses.map((item, index) => {
                const packageItem = packages[index] || { amount: 0 };
                return {
                    name: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                    // Stacked values
                    revenue: (item.amount || 0) + (packageItem.amount || 0),
                    courseRev: item.amount || 0,
                    packageRev: packageItem.amount || 0
                };
            });
            
            setRevenueChartData(mergedChartData);
        }
      }

      // 3. User Stats
      if (userRes.data?.success) {
        // Backend UserStatisticsDto keys: TotalStudents, TotalTeachers, etc. (PascalCase in C#, camelCase in JSON)
        const d = userRes.data.data;
        setUserStats({
            studentCount: d.totalStudents || 0,
            teacherCount: d.totalTeachers || 0,
            activeUsers: d.activeUsers || 0,
            blockedUsers: d.blockedUsers || 0
        });
      }

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val || 0);

  return (
    <div className="dashboard-container">
      {/* HEADER & FILTER */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={fetchAllData}
      />

      {/* KPI CARDS */}
      <div className="row g-4 mb-4">
        <KPICard
          title="Total Revenue"
          value={overview.totalRevenue}
          formatValue={formatCurrency}
          icon={MdAttachMoney}
          iconColor="#4f46e5"
          iconBgColor="#e0e7ff"
        />

        <KPICard
          title="Total Students"
          value={overview.totalStudents}
          formatValue={formatNumber}
          icon={MdPeople}
          iconColor="#166534"
          iconBgColor="#dcfce7"
          subtitle="Active learners"
        />

        <KPICard
          title="Total Teachers"
          value={overview.totalTeachers}
          formatValue={formatNumber}
          icon={MdSchool}
          iconColor="#b45309"
          iconBgColor="#fef3c7"
          subtitle="Content creators"
        />

        <KPICard
          title="New Users (30d)"
          value={overview.newUsersLast30Days}
          formatValue={formatNumber}
          icon={MdTrendingUp}
          iconColor="#991b1b"
          iconBgColor="#fee2e2"
          subtitle={
            <>
              <MdPersonAdd className="me-1" /> Latest Growth
            </>
          }
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="row g-4 mb-4">
        <RevenueChart
          data={revenueChartData}
          loading={loading}
          formatCurrency={formatCurrency}
        />

        <div className="col-lg-4">
          <UserDistributionChart userStats={userStats} />
          <RevenueBreakdown
            breakdown={revenueBreakdown}
            totalRevenue={overview.totalRevenue}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
}
