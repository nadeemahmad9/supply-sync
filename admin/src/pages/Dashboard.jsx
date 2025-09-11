
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaUsers, FaBox, FaShoppingCart, FaDollarSign, FaArrowUp, FaArrowDown } from "react-icons/fa"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import axios from "axios"
import LoadingSpinner from "../components/UI/LoadingSpinner"

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/admin/stats`),
                    axios.get(`http://localhost:5000/api/admin/analytics`),
                ])

                setStats(statsRes.data.data)
                setAnalytics(analyticsRes.data.data)
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" />
            </div>
        )
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats?.overview?.totalUsers || 0,
            icon: FaUsers,
            color: "bg-blue-500",
            change: "+12%",
            trend: "up",
        },
        {
            title: "Total Products",
            value: stats?.overview?.totalProducts || 0,
            icon: FaBox,
            color: "bg-green-500",
            change: "+5%",
            trend: "up",
        },
        {
            title: "Total Orders",
            value: stats?.overview?.totalOrders || 0,
            icon: FaShoppingCart,
            color: "bg-purple-500",
            change: `${stats?.overview?.orderGrowth?.toFixed(1) || 0}%`,
            trend: (stats?.overview?.orderGrowth || 0) >= 0 ? "up" : "down",
        },
        {
            title: "Monthly Revenue",
            value: `$${stats?.overview?.monthlyRevenue?.toFixed(2) || 0}`,
            icon: FaDollarSign,
            color: "bg-red-500",
            change: `${stats?.overview?.revenueGrowth?.toFixed(1) || 0}%`,
            trend: (stats?.overview?.revenueGrowth || 0) >= 0 ? "up" : "down",
        },
    ]

    const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => {
                    const Icon = card.icon
                    const TrendIcon = card.trend === "up" ? FaArrowUp : FaArrowDown

                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                    <div className="flex items-center space-x-1 mt-2">
                                        <TrendIcon className={`w-3 h-3 ${card.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                                        <span className={`text-sm font-medium ${card.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                                            {card.change}
                                        </span>
                                        <span className="text-sm text-gray-500">vs last month</span>
                                    </div>
                                </div>
                                <div className={`${card.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white rounded-lg shadow-md p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.salesData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Category Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white rounded-lg shadow-md p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics?.categoryData || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {(analytics?.categoryData || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Recent Orders and Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white rounded-lg shadow-md p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                    <div className="space-y-4">
                        {stats?.recentOrders?.slice(0, 5).map((order) => (
                            <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                                    <p className="text-sm text-gray-600">{order.user?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                                    <span
                                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${order.status === "delivered"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "shipped"
                                                ? "bg-blue-100 text-blue-800"
                                                : order.status === "processing"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Low Stock Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-white rounded-lg shadow-md p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
                    <div className="space-y-4">
                        {stats?.lowStockProducts?.slice(0, 5).map((product) => (
                            <div key={product._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-600">Min Stock: {product.minStock}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        {product.stock} left
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Dashboard
