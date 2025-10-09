import z from "zod";
import { supabase } from "../config/supabaseClient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import router from "./indexRoutes.js";

const postSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(5, "Content must be at least 5 characters")
});

router.get("/all", authMiddleware, async (req, res) => {
    const { data: post, error: postError  } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", req.user.id);

    if (postError) {
        console.error("Error while retrieving posts: ", postError)
        return res.render("index", { error: "Internal Error Occured. Contact Support!" });
    }

    const message = req.session.message;
    req.session.message = null;

    res.render("posts/allPosts", { posts: post, error:null, message });
});

router.get("/create", authMiddleware, (req, res) => {
    res.render("posts/create", { post: null, error:null });
});

router.post("/create", authMiddleware, async (req, res) => {
    const validation_result = postSchema.safeParse(req.body);
    if (!validation_result.success) {
        const errorMessage = validation_result.error.issues[0].message;
  
        return res.status(400).render("posts/create", {
            error: errorMessage,
            post: req.body,
        });
    }

    const { title, content } = validation_result.data;

    const { data, error: postError } = await supabase
        .from("posts")
        .insert([{
            user_id: req.user.id,
            title,
            content
        }]);

    if (postError) {
        console.error("Error inserting posts: ", postError)
        return res.render("posts/allPosts", { posts: [], error: "Error While Creating Posts. Contact Support!", message: null });
    }

    res.redirect("/posts/all");
});

router.get("/edit/:id", authMiddleware, async (req, res) => {
    const { data: post, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", req.params.id)
        .single();

    if (postError) {
        console.error("Error inserting posts: ", postError)
        return res.render("posts/allPosts", {posts: [], error: "Error While Retreiving Posts. Contact Support!", message: null });
    }

    res.render("posts/edit", { post, error: null});
});

router.post("/edit", authMiddleware, async (req, res) => {
    const validation_result = postSchema.safeParse(req.body);
    if (!validation_result.success) {
        const errorMessage = validation_result.error.issues[0].message;
  
        return res.status(400).render("posts/edit", {
            error: errorMessage,
            post: req.body,
        });
    }


    const { id, title, content } = req.body;

    const { data, error: postError } = await supabase
        .from("posts")
        .update({
            title,
            content })
        .eq("id", id);

    if (postError) {
        console.error("Error updating posts: ", postError)
        return res.render("posts/allPosts", {posts: [], error: "Error While Updating Posts. Contact Support!", message: null });
    }

    res.redirect("/posts/all");
});

router.get("/delete/:id", authMiddleware, async (req, res) => {
    const { data, error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", req.params.id);

    if (postError) {
        console.error("Error deleting posts: ", postError)
        return res.render("posts/allPosts", {posts: [], error: "Error While Deleting Posts. Contact Support!", message: null });
    }

    req.session.message = "Post deleted successfully!";
    res.redirect("/posts/all");
});

export default router
