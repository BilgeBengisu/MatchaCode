export async function displayDashboard(supabase) {
    // combined total streak display
    const combined_streak = await supabase
        .from('users')
        .select('streak')
        .order('streak', { ascending: true })
        .limit(1)
        .single();

    document.getElementById("totalStreak").innerText = combined_streak.data?.streak ?? 0;

    // problem count display
    const {data, error} = await supabase.rpc('total_problem_count');
    if (data) {
        document.getElementById('totalSolved').innerText = data;
    }

    // matcha owed display
    const {data: matchaData, error: matchaError} = await supabase
        .from('users')
        .select('matcha_owed');

    if (matchaData) {
        const totalMatchaOwed = matchaData.reduce((sum, user) => sum + (user.matcha_owed || 0), 0);
        document.getElementById('totalMatchaOwed').innerText = totalMatchaOwed;
    }
}