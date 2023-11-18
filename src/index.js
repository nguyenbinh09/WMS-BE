const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const warehouseRoute = require("./routes/warehouseRoute");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const cookieParser = require("cookie-parser");

//Connect DB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Kết nối thành công!");
  })
  .catch((err) => {
    throw err;
  });

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("common"));
app.use(cookieParser());

//ROUTES
app.use("/api/warehouse", warehouseRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);

app.listen(port, () => {
  console.log("Server is running in port ", +port);
});
