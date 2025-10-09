import jwt from "jsonwebtoken";

export function guestMiddleware(req, res, next) {
	const token = req.cookies.token;
	if (!token) return next();

	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
		if (err) return next();

		return res.redirect("/");
	});
}
