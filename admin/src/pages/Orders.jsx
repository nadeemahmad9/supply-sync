
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiSearch, FiFilter, FiEye, FiPackage, FiTruck, FiCheck, FiClock, FiDownload } from "react-icons/fi"
import { Link } from "react-router-dom"
import axios from "axios"
import Pagination from "../components/UI/Pagination"

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchOrders()
    }, [currentPage, searchTerm, statusFilter])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`http://localhost:5000/api/admin/orders`, {
                params: {
                    page: currentPage,
                    search: searchTerm,
                    status: statusFilter,
                    limit: 10,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
                },
            })

            setOrders(response.data.orders)
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
                    },
                },
            )
            fetchOrders()
        } catch (error) {
            console.error("Error updating order status:", error)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <FiClock className="w-4 h-4 text-yellow-600" />
            case "processing":
                return <FiPackage className="w-4 h-4 text-blue-600" />
            case "shipped":
                return <FiTruck className="w-4 h-4 text-purple-600" />
            case "delivered":
                return <FiCheck className="w-4 h-4 text-green-600" />
            default:
                return <FiClock className="w-4 h-4 text-gray-600" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "processing":
                return "bg-blue-100 text-blue-800"
            case "shipped":
                return "bg-purple-100 text-purple-800"
            case "delivered":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const exportOrders = () => {
        // Implement CSV export functionality
        console.log("Exporting orders...")
    }

    return (
        <div className="p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                        <p className="text-gray-600">Manage and track all customer orders</p>
                    </div>
                    <button
                        onClick={exportOrders}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        <FiDownload className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 mb-6"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search orders by ID, customer name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">#{order._id.slice(-8).toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{order.user?.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.items.length} items</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    ${order.totalAmount?.toFixed(2) || "0.00"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    to={`/orders/${order._id}`}
                                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                    <span>View</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {orders.length === 0 && (
                            <div className="text-center py-12">
                                <FiPackage className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-600">No orders found</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default Orders
