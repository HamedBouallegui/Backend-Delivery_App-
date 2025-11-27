const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const livreurRoutes = require("./routes/livreurRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Backend from NodeJS!");
});

app.use("/api/auth", authRoutes);
app.use("/api/produits", productRoutes);
app.use("/api/commandes", orderRoutes);
app.use("/api/livreurs", livreurRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
