
import { motion } from "framer-motion"

const LoadingSpinner = ({ size = "medium", color = "red" }) => {
    const sizeClasses = {
        small: "h-4 w-4",
        medium: "h-8 w-8",
        large: "h-12 w-12",
    }

    const colorClasses = {
        red: "border-red-500",
        white: "border-white",
        gray: "border-gray-500",
    }

    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full`}
        />
    )
}

export default LoadingSpinner
