
import { createClient } from '@/utils/supabase/client';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SupabaseClient } from '@supabase/supabase-js';

// [NOTE}POSTGRESQLなのでSSG
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllLessons = async (supabase: SupabaseClient<any, "public", any>) => {
  const {data: lessons, error } = await supabase.from("lesson").select("*");
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return lessons;
}

export default async function Home() {
	const supabase = createClient();
  const lessons = await getAllLessons(supabase)
  return (
    <main className="w-full max-w-3xl mx-auto my-16 px-2">
      <div className="flex flex-col gap-3">
      {lessons?.map((Lesson) => (
        <Link href={`/${Lesson.id}`} key={Lesson.id}>
          <Card>
            <CardHeader>
              <CardTitle>{Lesson.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{Lesson.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}     
      </div>
  </main>
  );
}