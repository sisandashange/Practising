// LiveComponent.js
window.BouncyLiveComponent = {
  render: async function() {
    const sheet = document.getElementById('sheet');
    if (!sheet || !window.liveSession) return;
    
    const s = window.liveSession;
    sheet.innerHTML = `
      <div class="live-screen live-room" style="background:#000;height:100%;display:flex;flex-direction:column;position:relative;">
        <div class="live-head" style="position:absolute;top:10px;left:10px;right:10px;z-index:10;display:flex;justify-content:space-between;">
          <span style="background:#f33;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:12px;">LIVE</span>
          <button class="live-close" onclick="window.endLiveStream(true)" style="background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:20px;">×</button>
        </div>
        <div class="live-video-wrap" id="live-video-container" style="flex:1;position:relative;overflow:hidden;">
          <video id="live-remote-video" autoplay playsinline style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;"></video>
          <video id="live-local-video" autoplay playsinline muted style="position:absolute;bottom:20px;right:20px;width:90px;height:140px;border-radius:12px;object-fit:cover;border:2px solid #fff;z-index:5;display:${s.host ? 'block' : 'none'};"></video>
        </div>
        <div class="live-bottom" style="padding:20px;background:linear-gradient(transparent, #000);z-index:10;">
          <p style="color:#fff;font-weight:bold;margin-bottom:10px;">@${s.hostName || 'Host'} is live</p>
          <div style="display:flex;gap:10px;">
            <input type="text" placeholder="Say something..." style="flex:1;border-radius:20px;padding:10px 15px;border:none;background:#222;color:#fff;">
            <button style="background:#f33;color:#fff;border-radius:20px;padding:0 20px;font-weight:bold;">Send</button>
          </div>
        </div>
      </div>
    `;
    
    // Connect Host Stream
    if (s.host && s.stream) {
      document.getElementById('live-local-video').srcObject = s.stream;
    }
    if (s.remote) {
      document.getElementById('live-remote-video').srcObject = s.remote;
    }
    
    window.liveSession._video = document.getElementById('live-remote-video');
    window.liveSession._backgroundVideo = document.getElementById('live-remote-video');
    window.liveSession._room = sheet.querySelector('.live-room');
  }
};