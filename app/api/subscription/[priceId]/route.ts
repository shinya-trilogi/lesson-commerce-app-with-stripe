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

    const priceId = params.priceId;

    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

    try {
        const session = await stripe.checkout.sessions.create({
          customer: stripe_customer_data?.stripe_customer,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/canceled`,
        });
    
        return NextResponse.json({ id: session.id });
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        return NextResponse.json("Stripe error", { status: 500 });
      }
}