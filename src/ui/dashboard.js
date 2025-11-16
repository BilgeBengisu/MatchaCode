export async function displayDashboard(supabase) {
    const combined_streak = await supabase
        .from('users')
        .select('streak')
        .order('streak', { ascending: true })
        .limit(1)
        .single();

    document.getElementById("totalStreak").innerText = combined_streak.data?.streak ?? 0;
}