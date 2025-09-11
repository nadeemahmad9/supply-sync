
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import axios from "axios"
import toast from "react-hot-toast"
import LoadingSpinner from "../components/UI/LoadingSpinner"
import Pagination from "../components/UI/Pagination"

const Products = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({})
    const [filters, setFilters] = useState({
        search: "",
        category: "all",
        page: 1,
        limit: 10,
    })

    useEffect(() => {
        fetchProducts()
    }, [filters])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== "all") {
                    params.append(key, value)
                }
            })

            const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`)
            setProducts(response.data.data)
            setPagination(response.data.pagination)
        } catch (error) {
            console.error("Error fetching products:", error)
            toast.error("Error fetching products")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${productId}`)
                toast.success("Product deleted successfully")
                fetchProducts()
            } catch (error) {
                console.error("Error deleting product:", error)
                toast.error("Error deleting product")
            }
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setFilters((prev) => ({ ...prev, page: 1 }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600">Manage your product inventory</p>
                </div>
                <Link
                    to="/products/new"
                    className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Categories</option>
                        <option value="Desk Accessories">Desk Accessories</option>
                        <option value="Files & Folders">Files & Folders</option>
                        <option value="Office Basics">Office Basics</option>
                        <option value="Pens & Writing">Pens & Writing</option>
                        <option value="School Supplies">School Supplies</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="large" />
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product, index) => (
                                        <motion.tr
                                            key={product._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={
                                                            product.images && product.images.length > 0
                                                                ? product.images[0].url
                                                                : `/placeholder.svg?height=40&width=40&query=${product.name}`
                                                        }
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500">{product.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.stock <= 0
                                                        ? "bg-red-100 text-red-800"
                                                        : product.stock <= product.minStock
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {product.stock} units
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {product.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link to={`/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-900 p-1">
                                                        <FaEdit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <Pagination
                                    currentPage={pagination.current}
                                    totalPages={pagination.pages}
                                    onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No products found.</p>
                        <Link
                            to="/products/new"
                            className="mt-4 inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            <FaPlus className="w-4 h-4" />
                            <span>Add First Product</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products
