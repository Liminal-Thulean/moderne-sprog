const { supabase } = require("../shared/supabase");

module.exports = async function (context, req) {
  context.res = {
    headers: { "Content-Type": "application/json" }
  };

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

  // Get user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, role")
    .eq("provider_id", providerId)
    .single();

  if (userError || !user) {
    context.res.status = 404;
    context.res.body = JSON.stringify({ error: "User not found" });
    return;
  }

  // Get all unit progress
  const { data: unitProgress, error: progressError } = await supabase
    .from("unit_progress")
    .select("unit_id, module_id, status, score_pct, attempts, completed_at")
    .eq("user_id", user.id);

  if (progressError) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: "Could not fetch progress" });
    return;
  }

  // Get section scores for all units
  const { data: sectionScores } = await supabase
    .from("section_scores")
    .select("unit_id, section_id, correct, total, attempted_at")
    .eq("user_id", user.id);

  // If moderator, all units are unlocked
  const isModerator = user.role === "moderator";

  context.res.status = 200;
  context.res.body = JSON.stringify({
    is_moderator: isModerator,
    units: unitProgress || [],
    sections: sectionScores || [],
    completed: (unitProgress || [])
      .filter(u => u.status === "complete")
      .map(u => u.unit_id),
  });
};
