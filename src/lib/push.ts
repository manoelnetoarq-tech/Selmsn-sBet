import { supabase } from './supabase';

const PUBLIC_VAPID_KEY = 'BBoIHHoP8yHPq8RTk3BbLzzgJe7kiOWOsVyDFMnFgDSHmMqLxJDeJ9uhDc_xjf-qjPABv5iIGH_rrkLQpGt6rMI';

// Convert base64 VAPID key to Uint8Array needed for Web Push
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Falha ao registrar Service Worker:', error);
      return null;
    }
  }
  return null;
}

export async function isPushEnabled() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Notificações Push não são suportadas neste navegador.');
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.error('Service worker não está registrado');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    alert('Você precisa permitir as notificações no navegador.');
    return false;
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });

    // Pega o user_id logado
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (userId) {
      const subJson = subscription.toJSON();
      // Salva a subscription no Supabase
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }, { onConflict: 'user_id, endpoint' });
    }

    return true;
  } catch (err) {
    console.error('Falha ao se inscrever para push:', err);
    return false;
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    
    // Remove do banco de dados (se estiver logado)
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (userId) {
      await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    }
    
    return true;
  }
  return false;
}

export async function sendLocalTestNotification() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.showNotification('Teste da Resenha', {
        body: 'As notificações estão funcionando perfeitamente!',
        icon: '/Icon.png'
      });
    }
  } else {
    alert("Permissão não concedida.");
  }
}
