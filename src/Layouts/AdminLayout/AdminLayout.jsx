import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../Routes/Paths";
import "./AdminLayout.css";

// Icons (Using React Icons)
import { 
  MdDashboard, 
  MdClass, 
  MdPeople, 
  MdAttachMoney, 
  MdSettings, 
  MdLogout,
  MdNotifications,
  MdSearch 
} from "react-icons/md";
import { useAuth } from "../../Context/AuthContext";

export default function AdminLayout() {
  const { user, roles, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = roles.some((role) => {
    const roleName = typeof role === 'string' ? role : role?.name || role;
    return roleName === "SuperAdmin" || 
           roleName === "ContentAdmin" || 
           roleName === "FinanceAdmin" ||
           roleName === "Admin";
  });

  useEffect(() => {
    // Debug: Log roles to check
    console.log("=== AdminLayout DEBUG ===");
    console.log("Roles:", roles);
    console.log("Is Authenticated:", isAuthenticated);
    console.log("Is Admin:", isAdmin);
    console.log("Loading:", loading);

    if (!loading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        navigate(ROUTE_PATHS.LOGIN);
        return;
      }
      
      if (!isAdmin) {
        console.log("Not admin, redirecting to home");
        navigate(ROUTE_PATHS.HOME);
        return;
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, roles]);

  const handleLogout = () => {
    logout(navigate);
  };

  // Show loading or nothing while checking auth
  if (loading || !isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span>LEARN ENGLISH ADMIN</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink 
            to={ROUTE_PATHS.ADMIN.DASHBOARD} 
            className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
          >
            <MdDashboard /> Dashboard
          </NavLink>

          <NavLink 
            to={ROUTE_PATHS.ADMIN.COURSES} 
            className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
          >
            <MdClass /> Course Management
          </NavLink>

          <NavLink 
            to={ROUTE_PATHS.ADMIN.USERS} 
            className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
          >
            <MdPeople /> User Management
          </NavLink>

          <NavLink 
            to={ROUTE_PATHS.ADMIN.FINANCE} 
            className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
          >
            <MdAttachMoney /> Finance
          </NavLink>

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <NavLink to="/admin/settings" className="menu-item">
              <MdSettings /> System Settings
            </NavLink>
            <button onClick={handleLogout} className="menu-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <MdLogout /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        {/* TOP HEADER */}
        <header className="admin-header">
          <div className="header-search">
            <MdSearch style={{ position: 'absolute', marginLeft: '10px', marginTop: '10px', color: '#94a3b8' }} />
            <input type="text" placeholder="Search anything..." style={{ paddingLeft: '35px' }} />
          </div>

          <div className="header-actions">
            <button className="header-btn">
              <MdNotifications />
              <span className="badge">3</span>
            </button>
            <div className="admin-profile">
              <span style={{ fontWeight: 600, color: '#334155' }}>{user?.fullName || "Admin"}</span>
              <img 
                src={user?.avatarUrl || "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"} 
                alt="Admin" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', marginLeft: '10px', verticalAlign: 'middle' }} 
              />
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
