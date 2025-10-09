import passport from "passport";
import jwt from "jsonwebtoken";

// When importing a third party library check whether
// its exporting a named export and import it correctly
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { supabase } from "../config/supabaseClient.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/user/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { data: user, error: userError } = await supabase
                    .from("full_user")
                    .select("*")
                    .eq("google_id", profile.id)
                    .maybeSingle();

                if (userError) {
                    console.error("Supabase fetching error:", userError);
                    throw new Error("Database error while fetching user.");
                }

                let finalUser = user;

                if (!user) {
                    const { data: newUser, error: newUserError } = await supabase
                        .from("user-creds")
                        .insert([{ google_id: profile.id }])
                        .select()
                        .single();

                    if (newUserError) {
                        console.error("Supabase insert error:", newUserError);
                        throw new Error("Could not create new user credentials.");
                    }

                    const { data: detailData, error: detailError } = await supabase
                        .from("user-details")
                        .insert([{ user_id: newUser.id,  name: profile.displayName}])
                        .select("id");

                    if (detailError) {
                        await supabase.from("user-creds").delete().eq("id", newUser.id);
                        console.error("Supabase insert error:", detailError);
                        throw new Error("Error creating user details. Account rolled back.");
                    }

                    const { data: user, error: userError } = await supabase
                    .from("full_user")
                    .select("*")
                    .eq("google_id", profile.id)
                    .maybeSingle();

                    finalUser = user;
                }

                const token = jwt.sign(
                    { id: finalUser.id, name: finalUser.name },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: "30m" }
                );

                done(null, { user: finalUser, token });
            } catch (err) {
                done(err, null);
            }
        }
    )
);

export default passport;
