import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) return res.redirect("/signin");

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error(err);
            return res.redirect("/signin");
        }

        req.user = decoded;
        next();
    });
}
