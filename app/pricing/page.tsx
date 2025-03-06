import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { cookies } from 'next/headers'
import initStripe, { Stripe } from "stripe"
import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import SubscriptionButton from '@/components/checkout/SubscriptionButton';
import AuthServerButton from '@/components/auth/AuthServerButton';
import Link from 'next/link';

interface Plan {
    id: string;
    name: string;
    price: string | null
    interval: Stripe.Price.Recurring.Interval | null;
    currency: string
}
const getAllPlans = async () => {
    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

    const {data: plansList} = await stripe.plans.list();

    const plans = await Promise.all(
        plansList.map(async(plan) => {
        const product = await stripe.products.retrieve(plan.product as string);
        return {
            id: plan.id,
            name: product.name,
            price: plan.amount_decimal,
            interval: plan.interval,
            currency: plan.currency
        };
    }))

    const sortesPlans = plans.sort((a,b) => parseInt(a.price!) - parseInt(b.price!))

    return sortesPlans;
}

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

const PricingPage = async () => {

  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore);
  const {data: user} = await supabase.auth.getSession()
// 高速化のための並列フェッチ
const [plans, profile] = await Promise.all([
     await getAllPlans(),
    await getProfileData(supabase)
    ])

  const showSubscribedButton = !!user.session && !profile?.is_subscribed;
  const showCreateAccountButton = !user.session;
  const showManageSubscriptionButton = !!user.session && profile?.is_subscribed;
  const isCurrentPlan = (plan: Plan) => {
    if (profile?.interval === plan.interval){
      return true
    }
    return false
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto py-16 flex justify-around">
        {plans.map((plan) => (
          <Card className={isCurrentPlan(plan) ? 'bg-cyan-100 shadow-md' : 'shadow-md'}  key={plan.id}>
            <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <div className="mr-3">{plan.name} プラン </div>
                    {isCurrentPlan(plan) && (
                      <div className="text-blue-700 font-bold ">
                        加入中
                      </div>
                      )}
                  </div>
                </CardTitle>
                <CardDescription>{plan.name}</CardDescription>
            </CardHeader>
            <CardContent>{plan.price} 円 / {plan.interval}</CardContent>
            <CardFooter>
                {showSubscribedButton && <SubscriptionButton planId={plan.id} />}
                {showCreateAccountButton && <AuthServerButton />}
                {showManageSubscriptionButton && (
                  <Button>
                    <Link href="/dashboard">サブスクリプション管理する
                    </Link>
                  </Button>)}
            </CardFooter>
        </Card>  
        ))} 
    </div>
  )
}

export default PricingPage