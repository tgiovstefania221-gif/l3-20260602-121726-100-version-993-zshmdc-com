(function() {
    window.initMoviePlayer = function(source) {
        var video = document.getElementById("videoPlayer");
        var button = document.getElementById("startPlayer");
        var attached = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attachSource();
            if (button) {
                button.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function() {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
