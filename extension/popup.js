document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('proxyList');
  const disableBtn = document.getElementById('disableBtn');

  // Функция для проверки текущих настроек браузера
  chrome.proxy.settings.get({}, async (details) => {
    const isFixed = details.value.mode === "fixed_servers";
    const currentProxy = isFixed ? details.value.rules.singleProxy : null;

    if (!isFixed) {
      disableBtn.classList.add('active');
    }

    // Загружаем список прокси после того, как узнали статус
    loadProxies(currentProxy);
  });

  // Кнопка отключения прокси
  disableBtn.addEventListener('click', () => {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      chrome.action.setBadgeText({ text: "" });
      window.close();
    });
  });

  async function loadProxies(currentProxy) {
    try {
      const response = await fetch('http://127.0.0.1:7654/proxies');
      const proxies = await response.json();

      container.innerHTML = '';

      if (proxies.length === 0) {
        container.innerHTML = '<small style="color:#666; padding: 4px; display:block;">Нет контейнеров proxy_*</small>';
        return;
      }

      proxies.forEach(proxy => {
        const btn = document.createElement('button');

        // Проверяем, совпадает ли порт этого прокси с текущим активным в браузере
        const isActive = currentProxy && currentProxy.port === proxy.port;

        if (isActive) {
          btn.classList.add('active');
          btn.innerHTML = `<span>🟢 ${proxy.name}</span><span>✓</span>`;
        } else {
          btn.innerHTML = `<span>⚪ ${proxy.name}</span>`;
        }

        btn.addEventListener('click', () => {
          const config = {
            mode: "fixed_servers",
            rules: {
              singleProxy: {
                scheme: "http",
                host: "127.0.0.1",
                port: proxy.port
              },
              bypassList: ["localhost", "127.0.0.1"]
            }
          };

          chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
            chrome.action.setBadgeText({ text: "ON" });
            chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
            window.close();
          });
        });

        container.appendChild(btn);
      });

    } catch (err) {
      container.innerHTML = '<small style="color:darksalmon; padding: 4px; display:block;">Ошибка связи с API</small>';
    }
  }
});