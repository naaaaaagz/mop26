const header = document.querySelector("[data-a]");
const nav = document.querySelector("[data-c]");
const navToggle = document.querySelector("[data-b]");
const heroBg = document.querySelector("[data-d]");
const scrollCue = document.querySelector(".scroll-down");
const backToTop = document.querySelector("[data-h]");
const players = Array.from(document.querySelectorAll("[data-e]"));
const contactForm = document.querySelector("#contact-form");

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
  scrollCue.classList.toggle("is-hidden", window.scrollY > 20);
  backToTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.7);

  if (heroBg) {
    heroBg.style.transform = `translate3d(0, ${window.scrollY * 0.78}px, 0)`;
  }
}

function closeMenu() {
  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function setPlaying(player, isPlaying) {
  const playButton = player.querySelector("[data-f]");
  const title = player.querySelector("h3").textContent.toLowerCase();
  player.classList.toggle("is-playing", isPlaying);
  playButton.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${title}`);
}

function stopOtherPlayers(currentPlayer) {
  players.forEach((player) => {
    if (player === currentPlayer) return;
    const audio = player.querySelector("audio");
    audio.pause();
    setPlaying(player, false);
  });
}

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement) {
    closeMenu();
  }
});

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

players.forEach((player) => {
  const button = player.querySelector("[data-f]");
  const audio = player.querySelector("audio");
  const progress = player.querySelector("[data-g]");

  audio.loop = false;

  button.addEventListener("click", () => {
    if (audio.paused) {
      stopOtherPlayers(player);
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    setPlaying(player, true);
  });

  audio.addEventListener("pause", () => {
    if (!audio.ended) {
      setPlaying(player, false);
    }
  });

  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.style.width = `${percent}%`;
  });

  audio.addEventListener("ended", () => {
    audio.pause();
    audio.currentTime = 0;
    progress.style.width = "0%";
    setPlaying(player, false);
  });
});

if (contactForm) {
  const checkLabel = contactForm.querySelector("#contact-check-label");
  const checkInput = contactForm.querySelector('input[name="quick_check"]');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector(".form-status");
  const originalButtonText = submitButton.textContent;
  let checkAnswer = "";

  function makeCheck() {
    const left = Math.floor(Math.random() * 7) + 2;
    const right = Math.floor(Math.random() * 8) + 1;
    checkAnswer = String(left + right);
    checkLabel.textContent = `${left} + ${right} =`;
    checkInput.value = "";
  }

  function setStatus(message, type) {
    status.textContent = message;
    status.className = `form-status ${type ? `is-${type}` : ""}`.trim();
  }

  makeCheck();

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "");

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (checkInput.value.trim() !== checkAnswer) {
      setStatus("Please answer the quick check correctly.", "error");
      makeCheck();
      checkInput.focus();
      return;
    }

    const formData = new FormData(contactForm);
    formData.delete("quick_check");
    formData.append("replyto", formData.get("email"));

    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "The message could not be sent.");
      }

      contactForm.reset();
      makeCheck();
      setStatus("Message sent successfully.", "success");
    } catch (error) {
      setStatus(error.message || "Something went wrong. Please try again.", "error");
    } finally {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
}
