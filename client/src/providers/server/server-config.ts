export const serverUrl = (() => {
  if (window.location.origin === "http://localhost:3000") {
    return "http://localhost:8080";
  }
  return window.location.origin;
})();

export const websocketUrl: string = (() => {
  return serverUrl.replace("http", "ws");
})();