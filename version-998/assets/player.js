(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.video-overlay');
        var stream = shell.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;
        if (!video || !stream) {
            return;
        }
        function attachStream() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.play().catch(function () {});
        }
        if (overlay) {
            overlay.addEventListener('click', attachStream);
        }
        video.addEventListener('click', function () {
            if (!started) {
                attachStream();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(setupPlayer);
    });
})();
