'use client'

import { createClient } from '@/utils/supabase/client';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';

const AuthClientButton = ({session}: {session: Session | null}) => {
    const router = useRouter();
	const supabase = createClient();
    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    }
return (
    <>
     {session ? (
        <Button onClick={handleSignOut}>ログアウト</Button>
     ) : (
        <Button onClick={handleSignIn}>サインイン</Button>
     )}
    </>
)
}

export default AuthClientButton