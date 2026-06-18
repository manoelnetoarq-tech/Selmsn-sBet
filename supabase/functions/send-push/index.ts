import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import webPush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BDwqgVAKA3xaxShVHrrtI9ItMF1Oh_E4iIWg9lmK3jSZOkqdxeQzM8I2oyAJ9o5QplyXgZou_CqOiKX49gWeXBc';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');

if (VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    'mailto:contato@manoelneto.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!VAPID_PRIVATE_KEY) {
      throw new Error('VAPID_PRIVATE_KEY não configurada no Edge Function');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { title, body, icon, url, userId } = await req.json();

    if (!title || !body) {
      throw new Error('Title e body são obrigatórios');
    }

    let query = supabaseClient.from('push_subscriptions').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhuma assinatura encontrada' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/Icon.png',
      url: url || '/'
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webPush.sendNotification(pushSubscription, notificationPayload);
        return { success: true, endpoint: sub.endpoint };
      } catch (err: any) {
        console.error('Erro ao enviar push para', sub.endpoint, err);
        // Remove assinaturas inválidas (410 Gone ou 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseClient.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
        return { success: false, endpoint: sub.endpoint, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);

    return new Response(JSON.stringify({ message: 'Notificações processadas', results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro na Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
