
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiClock, FiUser, FiMapPin, FiCreditCard } from "react-icons/fi"
import axios from "axios"

const OrderDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
                },
            })
            setOrder(response.data)
        } catch (error) {
            console.error("Error fetching order:", error)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (newStatus) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/orders/${id}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
                    },
                },
            )
            setOrder({ ...order, status: newStatus })
        } catch (error) {
            console.error("Error updating order status:", error)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <FiClock className="w-5 h-5 text-yellow-600" />
            case "processing":
                return <FiPackage className="w-5 h-5 text-blue-600" />
            case "shipped":
                return <FiTruck className="w-5 h-5 text-purple-600" />
            case "delivered":
                return <FiCheck className="w-5 h-5 text-green-600" />
            default:
                return <FiClock className="w-5 h-5 text-gray-600" />
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

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
                <button onClick={() => navigate("/orders")} className="text-red-600 hover:text-red-700">
                    Back to Orders
                </button>
            </div>
        )
    }

    return (
        <div className="p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate("/orders")}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            <span>Back to Orders</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
                            <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                        >
                            {getStatusIcon(order.status)}
                            <span className="ml-2 capitalize">{order.status}</span>
                        </span>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-white rounded-lg shadow-sm"
                >
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    <img
                                        src={
                                            item.product?.images?.[0]?.url ||
                                            `/placeholder.svg?height=40&width=40&query=${item.product?.name}`
                                        }
                                        alt={item.product?.images?.[0]?.alt || item.product?.name}
                                        className="w-10 h-10 rounded-lg object-cover"
                                    />




                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-gray-600 text-sm">{item.category}</p>
                                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-gray-600 text-sm">${item.price} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${(order.total / 1.08).toFixed(2)}</span >
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${((order.total * 0.08) / 1.08).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    ${order.total?.toFixed(2) || "0.00"}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Order Details */}
                <div className="space-y-6">
                    {/* Status Management */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
                        <div className="space-y-3">
                            {["pending", "processing", "shipped", "delivered"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => updateOrderStatus(status)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${order.status === status
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(status)}
                                        <span className="capitalize font-medium">{status}</span>
                                    </div>
                                    {order.status === status && <FiCheck className="w-4 h-4 text-red-600" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Customer Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <FiUser className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                    </p>
                                    <p className="text-gray-600">{order.user?.email}</p>
                                    <p className="text-gray-600">{order.shippingAddress?.phone}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shipping Address */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                        <div className="flex items-start space-x-3">
                            <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">
                                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                </p>
                                <p className="text-gray-600">{order.shippingAddress?.address}</p>
                                <p className="text-gray-600">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                        <div className="flex items-start space-x-3">
                            <FiCreditCard className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                                <p className="text-gray-600">Payment completed</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetail
