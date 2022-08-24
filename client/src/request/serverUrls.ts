export const serverUrl = (() => {
  if (window.location.origin === "http://localhost:3000") {
    return "http://localhost:8080";
  }
  if (window.location.origin === "http://127.0.0.1:3000") {
    return "http://127.0.0.1:8080";
  }
  return window.location.origin;
})();

export const websocketUrl: string = (() => {
  return serverUrl.replace("http", "ws");
})();