import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";

export const useModerationHistory = () => {
  const { userId, getToken } = useAuth();

  const fetchHistory = async () => {
    if (!userId) return [];

    // 🔥 Create supabase client with Clerk JWT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${await getToken({
              template: "supabase",
            })}`,
          },
        },
      }
    );

    // ⚠️ User's internal Postgres UUID is NOT Clerk ID
    // Your schema stores Clerk ID → users.clerk_id
    // So we must map Clerk → UUID first
    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userErr || !userRow) {
      console.error("User uuid fetch error:", userErr);
      return [];
    }

    const internalUserId = userRow.id;

    // 🔥 Pull all images + nested moderation logs (latest first)
    const { data, error } = await supabase
      .from("images")
      .select(
        `
        id,
        file_url,
        file_name,
        file_size,
        status,
        created_at,
        moderation_logs (
          id,
          result,
          verdict,
          created_at
        )
      `
      )
      .eq("user_id", internalUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Moderation history fetch error:", error);
      return [];
    }

    // 💡 Attach only the LATEST log to each image
    return data.map((image) => {
      const logs = image.moderation_logs ?? [];
      const latest = logs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )[0];

      return {
        ...image,
        latestLog: latest ?? null,
      };
    });
  };

  return { fetchHistory };
};
