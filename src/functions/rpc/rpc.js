const RPC = require("discord-rpc");

module.exports = (client) => {
  const clientId = process.env.CLIENT_ID; // Ganti dengan Client ID dari Discord Developer Portal
  
  // Membuat instance RPC client
  const rpcClient = new RPC.Client({ transport: "ipc" });

  // Login RPC client
  rpcClient.login({ clientId });

  // Event saat RPC terhubung
  rpcClient.on("ready", () => {
    console.log(`RPC connected as ${rpcClient.user.username}`);

    // Menyetel aktivitas Rich Presence
    rpcClient.setActivity({
      details: "Menjelajahi dunia Discord!", // Deskripsi utama
      state: "Mendengarkan musik", // Status tambahan
      startTimestamp: new Date(), // Timestamp waktu mulai
      largeImageKey: "large_image", // Gambar besar
      largeImageText: "Gambar Besar", // Tooltip gambar besar
      smallImageKey: "small_image", // Gambar kecil
      smallImageText: "Gambar Kecil", // Tooltip gambar kecil
      buttons: [
        // { label: "Kunjungi Website", url: "https://yourwebsite.com" },
        { label: "Join Discord", url: "https://discord.gg/Mp2sVmCcHt" },
      ],
    });
  });

  // Event saat ada error
  rpcClient.on("error", (err) => {
    console.error("RPC Error:", err);
  });
};
