import express from "express";
import { guestMiddleware } from "../middleware/guestMiddleware.js";

const router = express.Router();

router.get('/', (req, res) => {
	const error = req.session.error;
  	req.session.error = null;
	res.render("index", { error });
})

//Need to enforce confition if user not signed only allow
router.get("/signup", guestMiddleware, (req, res) => {
	return res.render("signup");
});

router.get("/signin", guestMiddleware, (req, res) => {
	return res.render("signin", { error: null });
});

router.get("/logout", (req, res) => {
	res.clearCookie("token");
	return res.redirect("/");
});

export default router;
