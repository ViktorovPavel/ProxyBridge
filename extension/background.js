// Проверяем текущий статус прокси при старте
async function updateBadge() {
  chrome.proxy.settings.get({}, (details) => {
    if (details.value.mode === "fixed_servers") {
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" }); // Зеленый
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  });
}

chrome.runtime.onStartup.addListener(updateBadge);
chrome.runtime.onInstalled.addListener(updateBadge);