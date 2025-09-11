// const mongoose = require("mongoose")

// const orderSchema = new mongoose.Schema(
//   {
//     orderNumber: {
//       type: String,
//       unique: true,
//       required: true,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//         total: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     subtotal: {
//       type: Number,
//       required: true,
//     },
//     tax: {
//       type: Number,
//       default: 0,
//     },
//     shipping: {
//       type: Number,
//       default: 0,
//     },
//     discount: {
//       type: Number,
//       default: 0,
//     },
//     total: {
//       type: Number,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
//       default: "pending",
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "failed", "refunded"],
//       default: "pending",
//     },
//     paymentMethod: {
//       type: String,
//       enum: ["cash", "card", "online"],
//       default: "cash",
//     },
//     shippingAddress: {
//       name: String,
//       street: String,
//       city: String,
//       state: String,
//       zipCode: String,
//       country: String,
//       phone: String,
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//     trackingNumber: {
//       type: String,
//       default: "",
//     },
//     estimatedDelivery: {
//       type: Date,
//     },
//     deliveredAt: {
//       type: Date,
//     },
//   },
//   {
//     timestamps: true,
//   },
// )

// // Generate order number before saving
// orderSchema.pre("save", async function (next) {
//   if (!this.orderNumber) {
//     const count = await mongoose.model("Order").countDocuments()
//     this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, "0")}`
//   }
//   next()
// })

// module.exports = mongoose.model("Order", orderSchema)




const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
   orderNumber: {
  type: String,
  unique: true,
  default: function () {
    return `ORD-${Date.now()}`;
  },
},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "cash",
    },

    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    notes: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// ✅ Generate unique order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
