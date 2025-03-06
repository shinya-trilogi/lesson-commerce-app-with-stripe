import React from 'react'
import AuthClientButton from './AuthClientButton';
import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers"

const AuthServerButton = async () => {
      const cookieStore = await cookies()
      const supabase = await createClient(cookieStore);
      const { data: user, error } = await supabase.auth.getSession();

      if (error) {
            console.error('Error fetching user:', error.message);
            return <div>Error fetching user information</div>;
          }
      const session = user.session;
return <AuthClientButton session={session}/>
}

export default AuthServerButton