const { supabase } = require("../shared/supabase");

module.exports = async function (context, req) {
  context.res = {
    headers: { "Content-Type": "application/json" }
  };

  if (req.method !== "POST") {
    context.res.status = 405;
    context.res.body = JSON.stringify({ error: "Method not allowed" });
    return;
  }

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
  const { unit_id, module_id, status, score_pct, sections } = req.body || {};

  if (!unit_id) {
    context.res.status = 400;
    context.res.body = JSON.stringify({ error: "unit_id is required" });
    return;
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("provider_id", providerId)
    .single();

  if (userError || !user) {
    context.res.status = 404;
    context.res.body = JSON.stringify({ error: "User not found" });
    return;
  }

  // Upsert unit progress
  const { error: upsertError } = await supabase
    .from("unit_progress")
    .upsert({
      user_id: user.id,
      unit_id,
      module_id,
      status: status || "in_progress",
      score_pct: score_pct || 0,
      attempts: 1,
      completed_at: status === "complete" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,unit_id" });

  if (upsertError) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: "Could not save progress", detail: upsertError.message });
    return;
  }

  // Save individual section scores if provided
  if (sections && sections.length > 0) {
    const sectionRows = sections.map(s => ({
      user_id: user.id,
      unit_id,
      section_id: s.section_id,
      correct: s.correct,
      total: s.total,
      attempted_at: new Date().toISOString(),
    }));

    await supabase
      .from("section_scores")
      .upsert(sectionRows, { onConflict: "user_id,unit_id,section_id" });
  }

  context.res.status = 200;
  context.res.body = JSON.stringify({ success: true });
};
