

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
    FaTachometerAlt,
    FaBox,
    FaShoppingCart,
    FaUsers,
    FaChartBar,
    FaCog,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa"

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const location = useLocation()

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: FaTachometerAlt,
        },
        {
            name: "Products",
            path: "/products",
            icon: FaBox,
        },
        {
            name: "Orders",
            path: "/orders",
            icon: FaShoppingCart,
        },
        {
            name: "Users",
            path: "/users",
            icon: FaUsers,
        },
        {
            name: "Analytics",
            path: "/analytics",
            icon: FaChartBar,
        },
        {
            name: "Settings",
            path: "/settings",
            icon: FaCog,
        },
    ]

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-lg border-r border-gray-200 flex flex-col"
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Admin</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isCollapsed ? <FaChevronRight className="w-4 h-4" /> : <FaChevronLeft className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")

                        return (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-red-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </motion.div>
    )
}

export default Sidebar
