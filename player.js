// One-song-at-a-time player for each band page.
(() => {
  const rows = Array.from(document.querySelectorAll("[data-track]"));
  if (!rows.length) return;

  let currentAudio = null;
  let currentBtn = null;
  const nowEl = document.querySelector("#nowPlaying");

  const setNow = (t) => { if (nowEl) nowEl.textContent = t || ""; };

  rows.forEach(row => {
    const src = row.getAttribute("data-src");
    const btn = row.querySelector("button[data-action='toggle']");
    const title = (row.querySelector("[data-title]")?.textContent || "Untitled").trim();
    if (!src || !btn) return;

    const audio = new Audio(src);
    audio.preload = "none";

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        btn.textContent = "Play";
        currentAudio = null;
        currentBtn = null;
        setNow("");
      }
    });

    btn.addEventListener("click", () => {
      // toggle same track
      if (currentAudio === audio) {
        if (audio.paused) {
          audio.play();
          btn.textContent = "Pause";
          setNow(`Now playing: ${title}`);
        } else {
          audio.pause();
          btn.textContent = "Play";
          setNow("");
        }
        return;
      }

      // start new track, stop old
      if (currentAudio) {
        currentAudio.pause();
        if (currentBtn) currentBtn.textContent = "Play";
      }

      currentAudio = audio;
      currentBtn = btn;
      audio.currentTime = 0;
      audio.play();
      btn.textContent = "Pause";
      setNow(`Now playing: ${title}`);
    });
  });
})();
