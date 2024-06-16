const http = require("http");

let pendingRequests = 0;

const updateConsole = () => {
  console.clear();
  console.log(`Pending requests: ${pendingRequests}`);
};

const proxy = http.createServer((req, res) => {
  pendingRequests++;
  updateConsole();

  const options = {
    hostname: "127.0.0.1",
    port: 8002,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true }).on("finish", () => {
      pendingRequests--;
      updateConsole();
    });
  });

  req.pipe(proxyReq, { end: true }).on("error", (error) => {
    console.error(`Request error: ${error}`);
    pendingRequests--;
    updateConsole();
  });
});

proxy.listen(8003, () => {
  console.log("Proxy server is running on port 8003");
});
