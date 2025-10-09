import "dotenv/config";

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import { setUser } from "./middleware/globalMiddleware.js";
import { handle404 } from "./middleware/errorHandlers.js";
import passport from "./middleware/passport.js";
import indexRoutes from './routes/indexRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js'

const app = express();
const PORT = process.env.APP_PORT || 3000;
const __dirname = process.cwd();

app.use(helmet());

app.use(cors({
	origin: "http://localhost:3000",
	methods: ["GET", "POST"],
	credentials: true,
}));

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 30,
			httpOnly: true,
			secure: process.env.ENVIRONMENT === "prod",
			sameSite: "lax",
		},
	})
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use(setUser);

// Routes
app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/posts', postRoutes);
app.use(handle404);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
