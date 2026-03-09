// auth.js — include this on every protected page
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="auth.js"></script>

const SUPABASE_URL = "https://tdyvlwiayrbkeqdcvtdi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeXZsd2lheXJia2VxZGN2dGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTcyNzAsImV4cCI6MjA4ODYzMzI3MH0.rw6VHSWf8m142kJVOFWZYQViU6NlHu8uPz7fwgxju94";

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Get current session and user profile ──────────────────────────────────────
async function getUser() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await _supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return profile ? { ...session.user, ...profile } : null;
}

// ── Require login — redirect to login.html if not authenticated ───────────────
async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = "/login.html";
    return null;
  }
  return user;
}

// ── Sign out ──────────────────────────────────────────────────────────────────
async function signOut() {
  await _supabase.auth.signOut();
  window.location.href = "/login.html";
}

// ── Save unit progress ────────────────────────────────────────────────────────
async function saveUnitProgress(userId, unitId, moduleId, status, scorePct) {
  const { error } = await _supabase
    .from("unit_progress")
    .upsert({
      user_id: userId,
      unit_id: unitId,
      module_id: moduleId,
      status,
      score_pct: scorePct,
      attempts: 1,
      completed_at: status === "complete" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,unit_id" });

  return !error;
}

// ── Save section scores ───────────────────────────────────────────────────────
async function saveSectionScores(userId, unitId, sections) {
  if (!sections || sections.length === 0) return true;

  const rows = sections.map(s => ({
    user_id: userId,
    unit_id: unitId,
    section_id: s.section_id,
    correct: s.correct,
    total: s.total,
    attempted_at: new Date().toISOString(),
  }));

  const { error } = await _supabase
    .from("section_scores")
    .upsert(rows, { onConflict: "user_id,unit_id,section_id" });

  return !error;
}

// ── Get all progress for current user ────────────────────────────────────────
async function getProgress(userId) {
  const { data: units } = await _supabase
    .from("unit_progress")
    .select("unit_id, module_id, status, score_pct, completed_at")
    .eq("user_id", userId);

  return {
    completed: (units || []).filter(u => u.status === "complete").map(u => u.unit_id),
    units: units || [],
  };
}

// ── Check language access ────────────────────────────────────────────────────
async function hasLanguageAccess(userId, language) {
  // Moderators always have access — checked via profile role
  const { data } = await _supabase
    .from("language_access")
    .select("active")
    .eq("user_id", userId)
    .eq("language", language)
    .eq("active", true)
    .single();

  return !!data;
}
