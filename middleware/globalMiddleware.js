import jwt from "jsonwebtoken";

export function setUser(req, res, next) {
	const token = req.cookies.token;

	if (!token) {
		res.locals.user = null;
		return next();
	}

	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
		if (err) {
			console.error(err);
			res.locals.user = null;
		} else {
			res.locals.user = decoded;
		}

		next();
	});
}
