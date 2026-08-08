import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { NavBar } from "./components/NavBar.jsx";
import { Welcome } from "./pages/Welcome.jsx";
import { Home } from "./pages/Home.jsx";
import { Card } from "./pages/Card.jsx";
import { Receipts } from "./pages/Receipts.jsx";
import { ReceiptDetail } from "./pages/ReceiptDetail.jsx";
import { Profile } from "./pages/Profile.jsx";

function ProtectedLayout({ children }) {
  const { customer, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="screen"><p className="muted">Loading…</p></div>;
  if (!customer) return <Navigate to="/welcome" state={{ from: location }} replace />;

  return (
    <>
      <main className="app-main">{children}</main>
      <NavBar />
    </>
  );
}

export function App() {
  const { customer, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/welcome"
        element={!loading && customer ? <Navigate to="/home" replace /> : <Welcome />}
      />
      <Route path="/home" element={<ProtectedLayout><Home /></ProtectedLayout>} />
      <Route path="/card" element={<ProtectedLayout><Card /></ProtectedLayout>} />
      <Route path="/receipts" element={<ProtectedLayout><Receipts /></ProtectedLayout>} />
      <Route path="/receipts/:id" element={<ProtectedLayout><ReceiptDetail /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
