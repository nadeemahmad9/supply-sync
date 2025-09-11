
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import LoadingSpinner from "../UI/LoadingSpinner"

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== "admin") {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRoute
