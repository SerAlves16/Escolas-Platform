import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, password, fullName, role, schoolId } = await req.json();

    if (!email || !password || !fullName || !role || !schoolId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create auth user
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = newUser.user.id;

    // Update profile with role and school
    await admin.from("profiles").update({
      role,
      school_id: schoolId,
      full_name: fullName,
      is_active: true,
    }).eq("id", userId);

    // Create role-specific records
    if (role === "teacher" || role === "class_director") {
      const { data: existing } = await admin.from("teachers")
        .select("id").eq("profile_id", userId).maybeSingle();
      if (!existing) {
        await admin.from("teachers").insert({
          school_id: schoolId,
          profile_id: userId,
        });
      }
    }

    if (role === "canteen" || role === "bar" || role === "stationery" || role === "staff_servicos") {
      const staffType = role === "canteen" ? "canteen" : role === "bar" ? "bar" : role === "stationery" ? "stationery" : "other";
      const { data: existing } = await admin.from("staff")
        .select("id").eq("profile_id", userId).maybeSingle();
      if (!existing) {
        await admin.from("staff").insert({
          school_id: schoolId,
          profile_id: userId,
          staff_type: staffType,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, userId, email, role }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
