import { H as Hls } from "./hls-vendor.js";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".play-overlay");

    if (!video) {
      return;
    }

    const stream = video.getAttribute("data-stream");
    let hls = null;
    let ready = false;

    const prepare = () => {
      if (ready || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        ready = true;
        return;
      }

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
      } else {
        video.src = stream;
        ready = true;
      }
    };

    const play = () => {
      prepare();
      overlay?.classList.add("is-hidden");
      const action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(() => {
          overlay?.classList.remove("is-hidden");
        });
      }
    };

    overlay?.addEventListener("click", play);
    video.addEventListener("play", () => overlay?.classList.add("is-hidden"));
    video.addEventListener("pause", () => {
      if (video.currentTime === 0 || video.ended) {
        overlay?.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", () => overlay?.classList.remove("is-hidden"));
    player.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    });
    player.tabIndex = 0;
  });
});
