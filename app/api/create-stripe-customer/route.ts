import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from "next/server";
import initStripe  from "stripe";

export async function POST(req : NextRequest) {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);
    const query = req.nextUrl.searchParams.get("API_ROUTE_SECRET");
    if( query !== process.env.API_ROUTE_SECRET) {
        return NextResponse.json({
            message: "APIを叩く権限がありません。"
        })
    }

    const data = await req.json();
    const {id, email} = data.record;
    console.log('data.record:',data.record)

    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);
    const customer = await stripe.customers.create({
        email,
    })

    await supabase
       .from("profile")
       .update({
         stripe_customer: customer.id,
       })
       .eq("id", id);
       // stripe_cutomerがsupabaseのTableに反映されないが、一旦skip

    return NextResponse.json({
        meassage: `stripe customer created ${customer.id}`,
    })
    
}