// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import NotFound from './pages/NotFound';
import Layout from './Layout';
import TagList from './pages/TagList';
import PrintPreviewPage from './pages/PrintPreviewPage';
import PhotoList from './pages/PhotoList';
import InspectionDetail from './pages/InspectionDetail';
import FormList from './pages/FormList';
import PrintInspectionReport from './pages/PrintInspectionReport';
import FormNumberInput from './pages/FormNumberInput';
function App() {
  // ---- auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // เพิ่ม loading state

  useEffect(() => {
    const hasSession =
      sessionStorage.getItem('usvt_name') && sessionStorage.getItem('usvt_branch');
    setIsLoggedIn(Boolean(hasSession));
    setIsLoading(false); // เซ็ต loading เป็น false หลังตรวจสอบ session เสร็จ
  }, []);

  // แสดง loading ระหว่างตรวจสอบ session
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  // ---- protected wrapper
  const Protected = ({ children }) =>
    isLoggedIn ? children : <Navigate to="/" replace />;

  const protectedRoutes = [
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'tag', element: <TagList /> },
    { path: 'print-qr/:id', element: <PrintPreviewPage /> },
    { path: 'photoList', element: <PhotoList /> },
    { path: 'inspection/:id', element: <InspectionDetail /> },
    { path: 'formNumberInput/:id', element: <FormNumberInput /> },
    { path: 'FormList', element: <FormList /> },
    { path: "print/:inspNo", element: <PrintInspectionReport /> }
  ];

  return (
    <Router>
      <Routes>
        {/* login page */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={() => setIsLoggedIn(true)} />
          }
        />

        {/* protected routes - ย้ายไปอยู่นอก condition */}
        <Route path="/" element={<Layout />}>
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<Protected>{route.element}</Protected>}
            />
          ))}
        </Route>

        {/* not found page - ให้อยู่ล่างสุดเสมอ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;