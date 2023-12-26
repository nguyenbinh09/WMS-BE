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
const employeeRoute = require("./routes/employeeRoute");
const transactionRoute = require("./routes/transactionRoute");
const partnerRoute = require("./routes/partnerRoute");
const reportRoute = require("./routes/reportRoute");

//Connect DB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Kết nối thành công!");
  })
  .catch((err) => {
    return res.status(500).json(err);
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
app.use("/api/employee", employeeRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/partner", partnerRoute);
app.use("/api/report", reportRoute);

app.listen(port, () => {
  console.log("Server is running in port ", +port);
});
