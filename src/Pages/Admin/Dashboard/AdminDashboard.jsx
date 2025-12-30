import React, { useEffect, useState } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { MdTrendingUp, MdTrendingDown, MdPeople, MdAttachMoney, MdSchool, MdPersonAdd, MdCalendarToday } from "react-icons/md";
import { adminService } from "../../../Services/adminService";

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

  // Data for User Pie Chart
  const userPieData = [
    { name: 'Students', value: userStats.studentCount },
    { name: 'Teachers', value: userStats.teacherCount },
  ];

  const pieTotal = userStats.studentCount + userStats.teacherCount;

  // Prevent PieChart error if all values are 0
  const isPieDataEmpty = pieTotal === 0;

  return (
    <div className="dashboard-container">
      {/* HEADER & FILTER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
           <h1 className="page-title mb-1">Dashboard Overview</h1>
           <p className="text-muted mb-0">Real-time system analytics</p>
        </div>
        
        <div className="d-flex align-items-center gap-2">
           <div className="bg-white p-1 rounded border d-flex align-items-center">
              <MdCalendarToday className="text-muted ms-2 me-1"/>
              <select 
                className="form-select border-0 shadow-none py-1" 
                style={{width: 'auto', fontWeight: 500}}
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 3 Months</option>
              </select>
           </div>
           <button className="btn btn-primary" onClick={fetchAllData}>Refresh Data</button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="row g-4 mb-4">
        {/* Revenue Card */}
        <div className="col-md-3">
          <div className="admin-card d-flex justify-content-between align-items-start h-100">
            <div>
              <p className="text-muted mb-1 text-uppercase fw-bold small">Total Revenue</p>
              <h3 className="fw-bold mb-0 text-primary">{formatCurrency(overview.totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded text-primary" style={{backgroundColor: '#e0e7ff'}}>
              <MdAttachMoney size={28} color="#4f46e5"/>
            </div>
          </div>
        </div>

        {/* Students Card */}
        <div className="col-md-3">
          <div className="admin-card d-flex justify-content-between align-items-start h-100">
            <div>
              <p className="text-muted mb-1 text-uppercase fw-bold small">Total Students</p>
              <h3 className="fw-bold mb-0">{formatNumber(overview.totalStudents)}</h3>
              <small className="text-muted d-flex align-items-center mt-2">
                 Active learners
              </small>
            </div>
            <div className="p-3 rounded" style={{backgroundColor: '#dcfce7'}}>
              <MdPeople size={28} color="#166534"/>
            </div>
          </div>
        </div>

        {/* Teachers Card */}
        <div className="col-md-3">
          <div className="admin-card d-flex justify-content-between align-items-start h-100">
            <div>
              <p className="text-muted mb-1 text-uppercase fw-bold small">Total Teachers</p>
              <h3 className="fw-bold mb-0">{formatNumber(overview.totalTeachers)}</h3>
              <small className="text-muted d-flex align-items-center mt-2">
                 Content creators
              </small>
            </div>
            <div className="p-3 rounded" style={{backgroundColor: '#fef3c7'}}>
              <MdSchool size={28} color="#b45309"/>
            </div>
          </div>
        </div>

        {/* New Users Card */}
        <div className="col-md-3">
          <div className="admin-card d-flex justify-content-between align-items-start h-100">
            <div>
              <p className="text-muted mb-1 text-uppercase fw-bold small">New Users (30d)</p>
              <h3 className="fw-bold mb-0">{formatNumber(overview.newUsersLast30Days)}</h3>
              <small className="text-success d-flex align-items-center mt-2">
                 <MdPersonAdd className="me-1"/> Latest Growth
              </small>
            </div>
            <div className="p-3 rounded" style={{backgroundColor: '#fee2e2'}}>
              <MdTrendingUp size={28} color="#991b1b"/>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="row g-4 mb-4">
        {/* LEFT: Revenue Growth Area Chart */}
        <div className="col-lg-8">
          <div className="admin-card">
            <h5 className="fw-bold mb-4">Revenue Growth Trend</h5>
            <div style={{ width: '100%', height: 350 }}>
              {loading ? (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">Loading chart...</div>
              ) : revenueChartData.length === 0 ? (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">No revenue data available for this period.</div>
              ) : (
                <ResponsiveContainer>
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : val} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                    <Tooltip formatter={(value) => formatCurrency(value)}/>
                    <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fill="url(#colorRevenue)" 
                        name="Total Revenue" 
                        animationDuration={1000}
                    />
                    </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: User Distribution & Revenue Breakdown */}
        <div className="col-lg-4">
          {/* User Pie Chart */}
          <div className="admin-card mb-4" style={{height: '350px'}}>
            <h5 className="fw-bold mb-0">User Distribution</h5>
            <div style={{ width: '100%', height: '220px' }}>
               {isPieDataEmpty ? (
                   <div className="d-flex align-items-center justify-content-center h-100 text-muted">No user data available.</div>
               ) : (
                   <ResponsiveContainer>
                    <PieChart>
                    <Pie
                        data={userPieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {userPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
               )}
            </div>
            
            {!isPieDataEmpty && (
                <div className="text-center mt-2">
                <span className="badge bg-success bg-opacity-10 text-success me-2">
                    {((userStats.studentCount / (pieTotal || 1)) * 100).toFixed(1)}% Students
                </span>
                <span className="badge bg-warning bg-opacity-10 text-warning">
                    {((userStats.teacherCount / (pieTotal || 1)) * 100).toFixed(1)}% Teachers
                </span>
                </div>
            )}
          </div>

          {/* Revenue Breakdown Mini Widget */}
          <div className="admin-card">
              <h6 className="fw-bold mb-3">Revenue Source Breakdown</h6>
              
              <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                      <span>Course Sales</span>
                      <span className="fw-bold">{formatCurrency(revenueBreakdown.fromCourses)}</span>
                  </div>
                  {/* Progress bar calculated based on total */}
                  <div className="progress" style={{height: '6px'}}>
                      <div 
                        className="progress-bar bg-primary" 
                        role="progressbar" 
                        style={{width: `${overview.totalRevenue > 0 ? (revenueBreakdown.fromCourses / overview.totalRevenue) * 100 : 0}%`}}
                      ></div>
                  </div>
              </div>

              <div>
                  <div className="d-flex justify-content-between small mb-1">
                      <span>Teacher Packages</span>
                      <span className="fw-bold">{formatCurrency(revenueBreakdown.fromPackages)}</span>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                      <div 
                        className="progress-bar bg-info" 
                        role="progressbar" 
                        style={{width: `${overview.totalRevenue > 0 ? (revenueBreakdown.fromPackages / overview.totalRevenue) * 100 : 0}%`}}
                      ></div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
