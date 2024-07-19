const express = require("express")
const app = express()

const userRoute = require("./routes/user")
const userProfile = require("./routes/profile")
const userCourse = require("./routes/Course")
// const userPayment = require("./routes/Payment")

const database = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const {cloudinaryConnect} = require("./config/cloudinary")
const fileUpload = require("express-fileupload")
const dotenv = require("dotenv");
const contactUsRoute = require("./routes/Contact")

dotenv.config()
const PORT = process.env.PORT || 4000;

// database connect
database.connect()
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true
    })
)
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir:"/tmp/"
    })
)

// cloudinary connection
cloudinaryConnect();

// routes
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/profile", userProfile);
app.use("/api/v1/course", userCourse);
// app.use("/api/v1/payment", userPayment);
app.use("/api/v1/reach", contactUsRoute);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running..... "
    })
})

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})
