

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ import autoTable separately

import { FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign, FiDownload, FiCalendar } from "react-icons/fi"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import axios from "axios"

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        overview: {},
        salesData: [],
        categoryData: [],
        recentOrders: [],
    })
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState("30")

    useEffect(() => {
        fetchAnalytics()
    }, [dateRange])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`http://localhost:5000/api/admin/analytics`, {
                params: { period: "month" },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
                },
            })
            console.log(localStorage.getItem("admin_Token"))

            setAnalytics(response.data.data)
        } catch (error) {
            console.error("Error fetching analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    const exportReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Analytics Report", 14, 20);

        let y = 30;

        // Overview
        doc.setFontSize(14);
        doc.text("Overview", 14, y);
        y += 6;
        const overviewData = [
            ["Total Revenue", `$${(analytics.overview.totalRevenue || 0).toFixed(2)}`],
            ["Total Orders", analytics.overview.totalOrders || 0],
            ["Total Customers", analytics.overview.totalCustomers || 0],
            ["Avg Order Value", `$${(analytics.overview.avgOrderValue || 0).toFixed(2)}`],
        ];
        autoTable(doc, {
            startY: y,
            head: [["Metric", "Value"]],
            body: overviewData,
            theme: "grid",
        });
        y = doc.lastAutoTable.finalY + 10;

        // Sales Data
        doc.text("Sales Data", 14, y);
        y += 6;
        const salesData = analytics.salesData.map(s => [s.date, s.sales]);
        autoTable(doc, {
            startY: y,
            head: [["Date", "Sales"]],
            body: salesData,
            theme: "grid",
        });
        y = doc.lastAutoTable.finalY + 10;

        // Category Data
        doc.text("Category Performance", 14, y);
        y += 6;
        const categoryData = analytics.categoryData.map(c => [c._id, c.value]);
        autoTable(doc, {
            startY: y,
            head: [["Category", "Value"]],
            body: categoryData,
            theme: "grid",
        });
        y = doc.lastAutoTable.finalY + 10;

        // Recent Orders
        doc.text("Recent Orders", 14, y);
        y += 6;
        const recentOrders = analytics.recentOrders.map(o => [
            o._id.slice(-8).toUpperCase(),
            o.customerName,
            `$${o.totalAmount.toFixed(2)}`,
            new Date(o.createdAt).toLocaleDateString(),
        ]);
        autoTable(doc, {
            startY: y,
            head: [["Order ID", "Customer", "Total", "Date"]],
            body: recentOrders,
            theme: "grid",
        });

        doc.save(`analytics_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

    const statsCards = [
        {
            title: "Total Revenue",
            value: `$${(analytics.overview?.totalRevenue || 0).toFixed(2)}`,
            change: "+12.5%",
            icon: FiDollarSign,
            color: "bg-green-500",
        },
        {
            title: "Total Orders",
            value: analytics.overview?.totalOrders || 0,
            change: "+8.2%",
            icon: FiShoppingBag,
            color: "bg-blue-500",
        },
        {
            title: "Total Customers",
            value: analytics.overview?.totalCustomers || 0,
            change: "+15.3%",
            icon: FiUsers,
            color: "bg-purple-500",
        },
        {
            title: "Avg Order Value",
            value: `$${analytics.overview?.avgOrderValue?.toFixed(2) || "0.00"}`,
            change: "+5.1%",
            icon: FiTrendingUp,
            color: "bg-red-500",
        },
    ]

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                        <p className="text-gray-600">Track your business performance and insights</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                            </select>
                        </div>
                        <button
                            onClick={exportReport}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            <FiDownload className="w-4 h-4" />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                <p className="text-green-600 text-sm font-medium mt-1">{stat.change}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow-sm p-6"
                >
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow-sm p-6"
                >
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h2>
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

            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6 mb-8"
            >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics?.salesData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm"
            >
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {analytics.recentOrders?.map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-gray-600 text-sm">{order.customerName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                                    <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Analytics
