import SubscriptionManagementButton from '@/components/checkout/SubscriptionManagementButton';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Link from 'next/link';
import React from 'react'

const getProfileData = async (supabase: SupabaseClient<Database>) => {
  const {data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .single(); //objectとして取得
  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }
  return profile;
}

const Dashboard = async () => {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);

    const profile = await getProfileData(supabase)
  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-8">
        <h1 className="text-3xl mb-6">ユーザ管理ダッシュボード</h1>
        <div>
            {profile?.is_subscribed 
            ? ( <div >
                    <div className="flex items-center">
                      <div className="mr-3">プラン契約中:</div>
                      <div className="text-red-500">{profile.interval}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3">メールアドレス:</div>
                      <div>{profile.email}</div>
                    </div>
                    <div className="mt-6"><SubscriptionManagementButton /></div>
                </div>   
            )
            : (
              <div>
                プラン未加入です
                <div className="mt-6">
                  <Link href={"/pricing"} className="ml-4">
                      <Button >プラン一覧へ</Button>
                  </Link></div>
              </div>
              )}
        </div>
    </div>
  )
}

export default Dashboard