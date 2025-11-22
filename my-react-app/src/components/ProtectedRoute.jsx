import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user || !user.userId) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
