const { supabase } = require("../shared/supabase");

const MODERATOR_EMAILS = [
  "espersonal@protonmail.com"
];

module.exports = async function (context, req) {
  context.res = {
    headers: { "Content-Type": "application/json" }
  };

  // Get user identity from Azure SWA auth header
  const clientPrincipalHeader = req.headers["x-ms-client-principal"];
  if (!clientPrincipalHeader) {
    context.res.status = 401;
    context.res.body = JSON.stringify({ error: "Not authenticated" });
    return;
  }

  let principal;
  try {
    principal = JSON.parse(
      Buffer.from(clientPrincipalHeader, "base64").toString("utf8")
    );
  } catch (e) {
    context.res.status = 400;
    context.res.body = JSON.stringify({ error: "Invalid auth header" });
    return;
  }

  const providerId = principal.userId;
  const email = principal.userDetails;
  const displayName = principal.userDetails;
  const isModerator = MODERATOR_EMAILS.includes(email?.toLowerCase());

  // Try to find existing user
  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("provider_id", providerId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = no rows found, which is fine
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: "Database error", detail: fetchError.message });
    return;
  }

  let user = existing;

  if (!user) {
    // First login — create the user
    const role = isModerator ? "moderator" : "student";
    const { data: created, error: createError } = await supabase
      .from("users")
      .insert({
        provider_id: providerId,
        email: email?.toLowerCase(),
        display_name: displayName,
        role,
      })
      .select()
      .single();

    if (createError) {
      context.res.status = 500;
      context.res.body = JSON.stringify({ error: "Could not create user", detail: createError.message });
      return;
    }

    user = created;

    // Grant moderator full language access automatically
    if (isModerator) {
      await supabase.from("language_access").insert([
        { user_id: user.id, language: "danish", active: true },
        { user_id: user.id, language: "german", active: true },
      ]);
    }
  } else {
    // Update last_seen
    await supabase
      .from("users")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", user.id);
  }

  // Fetch language access
  const { data: access } = await supabase
    .from("language_access")
    .select("language, active, expires_at")
    .eq("user_id", user.id)
    .eq("active", true);

  context.res.status = 200;
  context.res.body = JSON.stringify({
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    is_moderator: user.role === "moderator",
    languages: access?.map(a => a.language) || [],
    created_at: user.created_at,
  });
};
