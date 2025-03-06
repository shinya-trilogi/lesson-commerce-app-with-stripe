import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    // serverサイドでセキュアな認証を実現
    if(code){
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore);
        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(requestUrl.origin)
}