import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import initStripe  from "stripe";

export async function POST(req: NextRequest) {

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);
    
    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);
    const endPointSecret = process.env.STRIPE_SIGNING_SECRET;
    const signature = req.headers.get("stripe-signature");

    const reqBuffer = Buffer.from(await req.arrayBuffer());

    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            reqBuffer,
            signature!,
            endPointSecret!
        );
        switch (event.type) {
            case "customer.subscription.created":
                const customerSubscriptionCreated = event.data.object;
                await supabase.from("profile").update({
                    is_subscribed: true,
                    interval: customerSubscriptionCreated.items.data[0].plan.interval
                })
                .eq("stripe_customer", event.data.object.customer);
                break;
            case "customer.subscription.updated":
                const customerSubscriptionUpdated = event.data.object;

                if(customerSubscriptionUpdated.status == "canceled"){
                    await supabase.from("profile").update({
                        is_subscribed: false,
                        interval: null
                    })
                    .eq("stripe_customer", event.data.object.customer);
                    break;
                } else {
                    await supabase.from("profile").update({
                        is_subscribed: true,
                        interval: customerSubscriptionUpdated.items.data[0].plan.interval
                    })
                    .eq("stripe_customer", event.data.object.customer);
                }
                break;
                case "customer.subscription.deleted":
                    await supabase.from("profile").update({
                        is_subscribed: false,
                        interval: null
                    })
                    .eq("stripe_customer", event.data.object.customer);
                break;
        }
    } catch (err: any){
        return NextResponse.json(`Webhook Error: ${err.message}`, { status: 401});
    }

    return NextResponse.json({received: true})
}
