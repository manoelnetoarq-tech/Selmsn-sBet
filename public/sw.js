self.addEventListener('push', function (event) {
  if (event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Nova Notificação', body: event.data.text() };
    }

    const options = {
      body: data.body,
      icon: data.icon || '/Icon.png',
      badge: '/Icon.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      },
    };

    event.waitUntil(self.registration.showNotification(data.title || 'Selman''s Bet', options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      // Try to focus an existing window if it matches the origin
      const hadWindowToFocus = clientsArr.some((windowClient) => {
        if (windowClient.url.includes(self.location.origin)) {
          windowClient.focus();
          if (windowClient.url !== self.location.origin + targetUrl) {
            windowClient.navigate(targetUrl);
          }
          return true;
        }
        return false;
      });
      
      // Otherwise, open a new window
      if (!hadWindowToFocus) {
        clients.openWindow(targetUrl).then((windowClient) => windowClient ? windowClient.focus() : null);
      }
    })
  );
});
