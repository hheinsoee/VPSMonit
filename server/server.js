const http = require("http");
const si = require("systeminformation");

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.setHeader("Access-Control-Allow-Credentials", true);

  if (req.url === "/realtime") {
    // Set headers for SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    const sendSystemInfo = () => {
      Promise.all([
        si.currentLoad(),
        si.mem(),
        si.time(),
        si.fsSize(),
        si.networkInterfaces(),
      ])
        .then(([cpuLoad, memory, time, disk, network]) => {
          const data = {
            cpuLoad: cpuLoad.cpus.map((cpu) => cpu.load),
            mem: {
              free: memory.free,
              total: memory.total,
              usedPercent: ((memory.active / memory.total) * 100).toFixed(2),
            },
            uptime: time.uptime,
            disk: disk.map((d) => ({
              filesystem: d.fs,
              size: d.size,
              used: d.used,
              available: d.available,
              capacity: d.use,
              mount: d.mount,
            })),
            net: network.map((n) => ({
              iface: n.iface,
              ip4: n.ip4,
              mac: n.mac,
              internal: n.internal,
            })),
          };

          res.write(`data: ${JSON.stringify(data)}\n\n`);
        })
        .catch((err) => {
          console.error("Error fetching system information:", err);
        });
    };

    // Send data every second
    const interval = setInterval(sendSystemInfo, 1000);

    // Clean up when the connection is closed
    req.on("close", () => {
      clearInterval(interval);
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Real-time API running on port ${PORT}`);
});