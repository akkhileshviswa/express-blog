import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import z from "zod";
import { supabase } from "../config/supabaseClient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import passport from "../middleware/passport.js";

const router = express.Router();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_EXPIRY = process.env.JWT_EXPIRES_IN;

const signupSchema = z.object({
    name: z.string()
        .min(5, "Name must be at least 5 characters")
        .max(30, "Name must not exceed 30 characters"),

    city: z.string()
        .min(5, "City must be at least 5 characters")
        .max(20, "City must not exceed 20 characters"),

    username: z.string()
        .min(5, "Username must be at least 5 characters")
        .max(15, "Username must not exceed 15 characters"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    mobile: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string()
            .regex(/^[0-9]{10}$/, "Mobile must be a valid 10-digit number")
            .optional()
        )
});

router.post('/signup', async (req, res) => {
    const validation_result = signupSchema.safeParse(req.body);
    if (!validation_result.success) {
        return res.status(400).json({ error: validation_result.error.issues[0].message });
    }

    try {
        const { name, city, mobile, username, password } = validation_result.data;

        const { data: existingUser, error: userCheckError } = await supabase
            .from("user-creds")
            .select("id")
            .eq("username", username)
            .maybeSingle();

        if (userCheckError) {
            console.error("Error while checking user existance: ", userCheckError)
            return res.status(500).json({ error: "Internal Error Occured. Contact Support!" });
        }

        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: credData, error: credError } = await supabase
            .from("user-creds")
            .insert([{ username, encpt_pswrd: hashedPassword }])
            .select("id")
            .single();

        if (credError) {
            return res.status(500).json({ error: "Cannot create Account. Contact Support!" });
        }

        const mobileValue = mobile === "" ? null : mobile;

        const { data: detailData, error: detailError } = await supabase
            .from("user-details")
            .insert([{
                user_id: credData.id,
                name: name,
                mobile: mobileValue,
                city: city
            }])
            .select("id")
            .single();

        if (detailError) {
            const { error: deleteError } = await supabase
                .from("user-creds")
                .delete()
                .eq("id", credData.id);
            if (deleteError) {
                console.error(`Cannot delete user_creds record ${credData.id}`, deleteError);
            }
            return res.status(500).json({ error: "Cannot create Account. Contact Support!" });
        }

        return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Something went wrong. Contact Support!" });
    }
});

router.post("/signin", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render("signin", { error: "All fields are required!" });
    }

    const { data: user, error } = await supabase
        .from("full_user")
        .select("*")
        .eq("username", username)
        .single();

    if (error) {
        console.error(error);
        return res.render("signin", { error: "Contact Support!" });
    }

    if (!user) {
        return res.render("signin", { error: "Invalid credentials!" });
    }

    const match = await bcrypt.compare(password, user.encpt_pswrd);
    if (!match) {
        return res.render("signin", { error: "Invalid credentials!" });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET_KEY,
        { expiresIn: JWT_EXPIRY }
    );

    res.cookie("token",
        token,
        {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === "prod",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000
        }
    );

    return res.render("index", { user: user });
});

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", (req, res, next) => {
    //Run passport middleware manually so we handle it like we want
    passport.authenticate("google", (err, data) => {
        if (err) {
            console.error("Google Auth Error:", err);
            req.session.error = "Google Sign In Failed. Contact Support!";
            return res.redirect("/");
        }

        if (!data || !data.token) {
            req.session.error = "Google Sign In Failed. Contact Support!";
            return res.redirect("/");
        }

        res.cookie("token",
            data.token,
            {
                httpOnly: true,
                secure: process.env.ENVIRONMENT === "prod",
                sameSite: "lax",
                maxAge: 60 * 60 * 1000
            }
        );

        res.redirect("/");
    })(req, res, next);
});

router.get('/profile', authMiddleware, (req, res) => {
    res.render("profile", { user: req.user });
});

export default router;
