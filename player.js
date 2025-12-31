(() => {
  const rows = Array.from(document.querySelectorAll("[data-track]"));
  if (!rows.length) return;

  let currentAudio = null;
  let currentBtn = null;

  const nowEl = document.querySelector("#nowPlaying");
  const seek = document.querySelector("#seek");
  const tcur = document.querySelector("#tcur");
  const tdur = document.querySelector("#tdur");

  const setNow = (t) => { if (nowEl) nowEl.textContent = t || ""; };

  const fmt = (sec) => {
    if (!isFinite(sec)) return "0:00";
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2,"0")}`;
  };

  function wireTimeline(audio) {
    if (!seek || !tcur || !tdur) return;

    // When metadata loads, show duration
    audio.addEventListener("loadedmetadata", () => {
      tdur.textContent = fmt(audio.duration);
    });

    // Update slider while playing
    audio.addEventListener("timeupdate", () => {
      if (!isFinite(audio.duration) || audio.duration === 0) return;
      tcur.textContent = fmt(audio.currentTime);
      const v = Math.round((audio.currentTime / audio.duration) * 1000);
      if (!seek.matches(":active")) seek.value = String(v);
    });

    audio.addEventListener("ended", () => {
      tcur.textContent = "0:00";
      seek.value = "0";
      setNow("");
    });

    // Seek when user drags/clicks slider
    seek.addEventListener("input", () => {
      if (!currentAudio || !isFinite(currentAudio.duration) || currentAudio.duration === 0) return;
      const frac = Number(seek.value) / 1000;
      currentAudio.currentTime = frac * currentAudio.duration;
    });
  }

  rows.forEach(row => {
    const src = row.getAttribute("data-src");
    const btn = row.querySelector("button[data-action='toggle']");
    const title = (row.querySelector("[data-title]")?.textContent || "Untitled").trim();
    if (!src || !btn) return;

    const audio = new Audio(src);
    audio.preload = "metadata"; // so duration loads when first played (or quickly after)

    // Attach timeline handlers once (they’ll follow currentAudio)
    wireTimeline(audio);

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        btn.textContent = "Play";
        currentAudio = null;
        currentBtn = null;
        setNow("");
      }
    });

    btn.addEventListener("click", () => {
      // Toggle the same track
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

      // Stop old
      if (currentAudio) {
        currentAudio.pause();
        if (currentBtn) currentBtn.textContent = "Play";
      }

      // Start new
      currentAudio = audio;
      currentBtn = btn;

      audio.currentTime = 0;
      audio.play();
      btn.textContent = "Pause";
      setNow(`Now playing: ${title}`);

      // Reset UI
      if (seek) seek.value = "0";
      if (tcur) tcur.textContent = "0:00";
      if (tdur) tdur.textContent = fmt(audio.duration);
    });
  });
})();
