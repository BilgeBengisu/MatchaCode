export async function handleCheckin(user_id) {
    const activityType = document.getElementById("activityType").value;

    let result = null;

    if (activityType == "problem") {
        const topic = document.getElementById("topic").value;
        const level = document.getElementById("level").value.toLowerCase();
        const status = document.getElementById("solved").value;
        console.log("Status value:", status);
        const solved = status === "completed" ? true : false;

        const { data, error } = await supabase.from('problems').insert([
            {
                user_id,
                topic,
                difficulty: level,
                solved
            }
        ])
        .select()
        .single();

        console.log("Problem insert data:", data, "error:", error);

        result = data;
    }
    if (activityType == "study") {
        const topic = document.getElementById("topic").value;
        const { data, error } = await supabase.from('study').insert([
            {
                user_id,
                topic: topic
            }
        ])
        .select()
        .single();

        console.log("Study insert data:", data, "error:", error);

        result = data;
    }

    const { data: streakData, error: streakError } = await supabase.rpc("increment_streak", {
        p_user_id: user_id
    });

    if (streakError) console.error("STREAK RPC ERROR:", streakError);

    return result;
};
