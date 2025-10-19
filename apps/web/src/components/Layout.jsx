import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="branding">
          <span className="logo">NovaPeople</span>
          <div>
            <h1>AI-Integrated HR &amp; Recruitment Control Center</h1>
            <p>
              Chuẩn hoá trải nghiệm nhân sự theo phong cách các nền tảng HR Tech hàng đầu:
              tổng hợp headcount, pipeline tuyển dụng và insight AI theo thời gian thực.
            </p>
          </div>
        </div>
        <div className="header-meta">
          <span className="badge">Realtime AI</span>
          <span className="badge">Skill Graph</span>
          <span className="badge accent">Talent Pulse</span>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-group">
          <button type="button" className="nav-chip active">Tổng quan</button>
          <button type="button" className="nav-chip">Nhân sự</button>
          <button type="button" className="nav-chip">Tuyển dụng</button>
          <button type="button" className="nav-chip">Học tập</button>
        </div>
        <div className="nav-cta">
          <button type="button" className="button ghost">Xuất báo cáo</button>
          <button type="button" className="button primary">Thêm mới</button>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Layout;
