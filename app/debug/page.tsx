import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth';

export default async function DebugPage() {
    const user = await getUser();
    const supabase = await createClient();

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Profile</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify({ user, profile }, null, 2)}
            </pre>
        </div>
    );
}
