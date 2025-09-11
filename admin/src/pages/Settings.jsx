

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiSave, FiSettings, FiShield, FiDatabase, FiBell } from "react-icons/fi"
import axios from "axios"

const Settings = () => {
    const [settings, setSettings] = useState({
        siteName: "OfficeSupply Admin",
        siteDescription: "Office Supply Management System",
        contactEmail: "admin@officesupply.com",
        supportPhone: "+1 (555) 123-4567",
        currency: "USD",
        taxRate: "8",
        shippingFee: "0",
        freeShippingThreshold: "50",
        lowStockThreshold: "10",
        emailNotifications: true,
        orderNotifications: true,
        stockNotifications: true,
    })

    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/settings`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            })
            if (response.data) {
                setSettings({ ...settings, ...response.data })
            }
        } catch (error) {
            console.error("Error fetching settings:", error)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setSettings({
            ...settings,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/settings`, settings, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error("Error saving settings:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600">Manage your application settings and preferences</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        <FiSave className="w-4 h-4" />
                        <span>{loading ? "Saving..." : "Save Changes"}</span>
                    </button>
                </div>
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg"
                    >
                        Settings saved successfully!
                    </motion.div>
                )}
            </motion.div>

            <div className="space-y-6">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow-sm"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <FiSettings className="w-5 h-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                <input
                                    type="text"
                                    name="siteName"
                                    value={settings.siteName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={settings.contactEmail}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                                <input
                                    type="tel"
                                    name="supportPhone"
                                    value={settings.supportPhone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                            <textarea
                                name="siteDescription"
                                value={settings.siteDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* E-commerce Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow-sm"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <FiDatabase className="w-5 h-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-gray-900">E-commerce Settings</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    name="taxRate"
                                    value={settings.taxRate}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Fee ($)</label>
                                <input
                                    type="number"
                                    name="shippingFee"
                                    value={settings.shippingFee}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold ($)</label>
                                <input
                                    type="number"
                                    name="freeShippingThreshold"
                                    value={settings.freeShippingThreshold}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                                <input
                                    type="number"
                                    name="lowStockThreshold"
                                    value={settings.lowStockThreshold}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow-sm"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <FiBell className="w-5 h-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="emailNotifications"
                                    checked={settings.emailNotifications}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <span className="font-medium text-gray-900">Email Notifications</span>
                                    <p className="text-sm text-gray-600">Receive email notifications for important events</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="orderNotifications"
                                    checked={settings.orderNotifications}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <span className="font-medium text-gray-900">Order Notifications</span>
                                    <p className="text-sm text-gray-600">Get notified when new orders are placed</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="stockNotifications"
                                    checked={settings.stockNotifications}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <span className="font-medium text-gray-900">Stock Notifications</span>
                                    <p className="text-sm text-gray-600">Alert when products are running low on stock</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* Security Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow-sm"
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <FiShield className="w-5 h-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Password Requirements</h3>
                                <p className="text-sm text-gray-600 mb-4">Configure password security requirements for users</p>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700">Minimum 8 characters</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700">Require uppercase letters</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700">Require numbers</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Settings
