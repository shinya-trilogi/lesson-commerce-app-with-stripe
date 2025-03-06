import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import initStripe  from "stripe";

export async function GET(
    req: NextRequest,
    { params } : {params: {priceId: string}}
) {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);
    const { data, error: userError } = await supabase.auth.getUser()
    const user = data.user;

    if(userError || !user) {
        return NextResponse.json("Unauthorized",{status: 401});
    }

    const { data: stripe_customer_data } = await supabase 
       .from("profile")
       .select("stripe_customer")
       .eq("id", user?.id)
       .single();


    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.billingPortal.sessions.create({
        customer: stripe_customer_data?.stripe_customer,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
    })

    try {
        return NextResponse.json({url: session.url});
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        return NextResponse.json("Stripe error", { status: 500 });
      }
}