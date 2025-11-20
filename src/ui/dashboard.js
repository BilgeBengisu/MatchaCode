import { formatTimestamp, formatActivityMessage } from '../utils/formatUtils.js';

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

    // --- Recent Activity: fetch latest problems and study entries and show top 2 ---
    try {
        // Fetch users (map user_id -> display name)
        const { data: usersData } = await supabase.from('users').select('user_id, username, name');
        const userMap = {};
        (usersData || []).forEach(u => {
            userMap[u.user_id] = u.username || u.name || u.user_id;
        });

        // Fetch recent problems and study entries (get a few from each and merge)
        const [{ data: problemsData, error: problemsError }, { data: studyData, error: studyError }] = await Promise.all([
            supabase.from('problems').select('id, user_id, topic, difficulty, solved, created_at').order('created_at', { ascending: false }).limit(5),
            supabase.from('study').select('id, user_id, topic, created_at').order('created_at', { ascending: false }).limit(5)
        ]);

        // Log any errors for debugging
        if (problemsError) {
            console.error('Error fetching problems:', problemsError);
        }
        if (studyError) {
            console.error('Error fetching study:', studyError);
        }

        console.log('Problems data:', problemsData);
        console.log('Study data:', studyData);

        const activities = [];

        if (problemsData && problemsData.length > 0) {
            problemsData.forEach(p => {
                const name = userMap[p.user_id] || p.user_id;
                const solved = p.solved;
                const topic = p.topic || 'a problem';
                const difficulty = p.difficulty ? ` (${p.difficulty})` : '';
                const message = solved ? `${name} solved ${topic}${difficulty} problem` : `${name} worked on ${topic}${difficulty} problem`;
                activities.push({
                    id: p.id,
                    message,
                    timestamp: p.created_at,
                    type: solved ? 'completed' : 'incomplete'
                });
            });
        } else {
            console.log('No problems data found or empty array');
        }

        if (studyData) {
            studyData.forEach(s => {
                const name = userMap[s.user_id] || s.user_id;
                const topic = s.topic || 'study session';
                const message = `${name} studied ${topic}`;
                activities.push({
                    id: s.id,
                    message,
                    timestamp: s.created_at,
                    type: 'general'
                });
            });
        }

        // Sort by timestamp desc and take top 2
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const topActivities = activities.slice(0, 2);

        // Render into DOM using the template in index.html
        const activityListEl = document.getElementById('activityList');
        const template = document.getElementById('activityItemTemplate');
        if (activityListEl && template) {
            activityListEl.innerHTML = '';
            if (topActivities.length === 0) {
                activityListEl.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <p>Start your LeetCode journey today!</p>
                    </div>
                `;
            } else {
                topActivities.forEach(act => {
                    const clone = template.content.cloneNode(true);
                    const desc = clone.querySelector('.item-description');
                    const dateEl = clone.querySelector('.item-date');

                    if (desc) desc.textContent = formatActivityMessage(act.message, act.type);
                    if (dateEl) dateEl.textContent = formatTimestamp(act.timestamp, 'relative');

                    activityListEl.appendChild(clone);
                });
            }
        }
    } catch (err) {
        console.error('Failed to load recent activities:', err);
    }
}