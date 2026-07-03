import express from "express";
import userRouter from "./routes/user.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import subjectRouter from "./routes/subject.routes.js";
import timetableRouter from "./routes/timetable.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import holidayRouter from "./routes/holiday.routes.js";
import extraClassRouter from "./routes/extraClass.routes.js";
import cancelledClassRouter from "./routes/cancelledClass.routes.js";
import adminRouter from "./routes/admin.routes.js";




const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/timetables", timetableRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/holiday", holidayRouter);
app.use("/api/v1/extra-classes", extraClassRouter);
app.use(
    "/api/v1/cancelled-classes",
    cancelledClassRouter
);
app.use("/api/v1/admin", adminRouter);

// Global Error Handler (always last)
app.use(errorHandler);

export default app;