import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
	console.error("Missing SUPABASE_URL or SUPABASE_KEY in env variables");
	throw new Error("Internal Error. Contact Support!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
//check where does this error handles