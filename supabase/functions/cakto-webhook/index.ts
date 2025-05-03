import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('CAKTO_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('CAKTO_WEBHOOK_SECRET not configured');
    }

    // Verify webhook signature
    const signature = req.headers.get('x-cakto-signature');
    if (!signature) {
      throw new Error('No signature provided');
    }

    // TODO: Implement signature verification
    // For now, we'll trust the webhook (in production, implement proper signature verification)

    // Parse webhook payload
    const payload = await req.json();

    // Process webhook based on event type
    switch (payload.event) {
      case 'payment.success':
        await handleSuccessfulPayment(supabaseClient, payload.data);
        break;
      case 'payment.failed':
        await handleFailedPayment(supabaseClient, payload.data);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancellation(supabaseClient, payload.data);
        break;
      default:
        console.log(`Unhandled event type: ${payload.event}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleSuccessfulPayment(supabase: any, data: any) {
  // Record transaction
  const { error: transactionError } = await supabase
    .from('payment_transactions')
    .insert([{
      transaction_id: data.id,
      customer_email: data.customer.email,
      amount: data.payment.amount,
      status: data.payment.status,
      payment_method: data.payment.method,
      created_at: data.created_at
    }]);

  if (transactionError) throw transactionError;

  // Get user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.customer.email)
    .single();

  if (userError) throw userError;

  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Update or create subscription
  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: user.id,
      subscription_id: data.id,
      plan_id: data.plan.id,
      status: 'active',
      access_level: getAccessLevelFromPlan(data.plan.id),
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    });

  if (subscriptionError) throw subscriptionError;
}

async function handleFailedPayment(supabase: any, data: any) {
  // Record failed payment
  const { error: transactionError } = await supabase
    .from('payment_transactions')
    .insert([{
      transaction_id: data.id,
      customer_email: data.customer.email,
      amount: data.payment.amount,
      status: 'failed',
      payment_method: data.payment.method,
      created_at: data.created_at
    }]);

  if (transactionError) throw transactionError;

  // Update subscription status if exists
  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'payment_failed',
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', data.id);

  if (subscriptionError) throw subscriptionError;
}

async function handleSubscriptionCancellation(supabase: any, data: any) {
  // Update subscription status
  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', data.id);

  if (subscriptionError) throw subscriptionError;
}

function getAccessLevelFromPlan(planId: string): string {
  // Map plan IDs to access levels
  const planMap: { [key: string]: string } = {
    'ieFcYbH': 'basic', // Basic plan
    '4w9c257_340495': 'pro', // Pro plan
    '6zmuxcz_340499': 'enterprise' // Enterprise plan
  };

  return planMap[planId] || 'basic';
} 