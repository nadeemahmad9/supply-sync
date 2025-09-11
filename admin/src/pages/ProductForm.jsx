import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiSave, FiX, FiUpload, FiTrash2 } from "react-icons/fi"
import axios from "axios"

const ProductForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = Boolean(id)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "",
        image: "",
        featured: false,
        onSale: false,
    })

    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState("")

    const categories = [
        "Desk Accessories",
        "Files & Folders",
        "Office Basics",
        "Others",
        "Paper & Notebooks",
        "Pens & Writing",
        "School Supplies",
    ]

    useEffect(() => {
        if (isEdit) {
            fetchProduct()
        }
    }, [id, isEdit])

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            })
            const product = response.data
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                originalPrice: product.originalPrice?.toString() || "",
                category: product.category,
                stock: product.stock.toString(),
                image: product.image,
                featured: product.featured || false,
                onSale: product.onSale || false,
            })
            setImagePreview(product.image)
        } catch (error) {
            console.error("Error fetching product:", error)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
                setFormData({ ...formData, image: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const productData = {
                ...formData,
                price: Number.parseFloat(formData.price),
                originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
                stock: Number.parseInt(formData.stock),
            }

            if (isEdit) {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/products/${id}`, productData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                })
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/products`, productData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                })
            }

            navigate("/products")
        } catch (error) {
            console.error("Error saving product:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h1>
                        <p className="text-gray-600">
                            {isEdit ? "Update product information" : "Create a new product in your inventory"}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/products")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                        <FiX className="w-5 h-5" />
                        <span>Cancel</span>
                    </button>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                        placeholder="Enter product description"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ($)</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Image */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h2>
                            <div className="flex items-start space-x-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL or Upload</label>
                                    <div className="flex space-x-4">
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleInputChange}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Enter image URL or upload file"
                                        />
                                        <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <FiUpload className="w-4 h-4" />
                                            <span>Upload</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                {imagePreview && (
                                    <div className="relative">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview("")
                                                setFormData({ ...formData, image: "" })
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                            <FiTrash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Options */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Options</h2>
                            <div className="flex space-x-6">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Featured Product</span>
                                </label>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="onSale"
                                        checked={formData.onSale}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">On Sale</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate("/products")}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            <FiSave className="w-4 h-4" />
                            <span>{loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default ProductForm
