import { createClient } from '@/utils/supabase/server';
import React from 'react'
import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js';
import {Database} from "@/lib/database.types";
import { YouTubeEmbed } from "@next/third-parties/google"
import { extractYouTubeVideoId } from '@/utils/extractYoutubeVideoId';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDetailLesson (supabase: SupabaseClient<Database>, id: number) {
  const {data: lesson, error } = await supabase
    .from("lesson")
    .select("*")
    .eq("id", id)
    .single(); //objectとして取得
  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }
  return lesson;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPremiunContent (supabase: SupabaseClient<Database>, id: number) {
  const {data: video, error } = await supabase
    .from("premium_content")
    .select("video_url")
    .eq("id", id)
    .single(); //objectとして取得
  if (error) {
    console.error('Error fetching video:', error);
    return null;
  }
  return video;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const LessonDetaliPage = async (props: PageProps) => {
  const params = await props.params;
  // `params.id`を数値に変換し、検証
  const {id}=  await params;
  const lessonId = parseInt(id, 10);
  if (isNaN(lessonId)) {
    console.error('Invalid lesson ID:', params.id);
    return <div>Invalid lesson ID</div>;
  }

  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore);
  
  // 高速化のための並列フェッチ
  const [lesson, profile, video] = await Promise.all([
    await getDetailLesson(supabase, lessonId),
    await getProfileData(supabase),
    await getPremiunContent(supabase, lessonId)
  ])

  const videoId = extractYouTubeVideoId(video?.video_url as  string) as string; 

  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-8">
      <h1 className="text-3xl mb-6">{lesson?.title}</h1>
      <p className="mb-8">{lesson?.description}</p>
      <div>
            {profile?.is_subscribed 
            ? ( <YouTubeEmbed height={400} videoid={videoId} /> )
            : (
              <div>
                <p className="text-blue-700">
                  プランに加入すると動画を視聴できます
                </p>
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

export default LessonDetaliPage