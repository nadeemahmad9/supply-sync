const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Product = require("../models/Product")
const productsData = require("../data/products.json")

// Load environment variables
dotenv.config()

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for seeding...")

    // Clear existing products
    await Product.deleteMany({})
    console.log("Existing products cleared...")

    // Insert new products
    const products = await Product.insertMany(productsData)
    console.log(`${products.length} products seeded successfully!`)

    // Display seeded products
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price} (${product.category})`)
    })

    process.exit(0)
  } catch (error) {
    console.error("Error seeding products:", error)
    process.exit(1)
  }
}

// Run the seeding function
seedProducts()
