 const TEXTS = {
    easy: [
      "The quick brown fox jumps over the lazy dog. A journey of a thousand miles begins with a single step. Time flies when you are having fun.",
      "Programming is the art of telling another human what one wants the computer to do. Clean code always looks like it was written by someone who cares.",
      "Success is not final, failure is not fatal — it is the courage to continue that counts. The secret of getting ahead is simply getting started.",
    ],
    medium: [
      "Typing quickly requires consistent practice and attention to accuracy. Many beginners focus only on speed, but developing proper finger placement and rhythm is equally important for long-term improvement.",
      "The internet has transformed how people communicate, learn, and work every day. From sending emails to coding software, typing efficiently has become an essential skill in the modern world.",
      "Learning to type witout looking at the keyboard can feel difficult at first. However, with regular practice and patience, it becomes a natural and effortless habit over time.",
    ],
    hard: [
      "Amidst the incessant influx of information in the digital age, the ability to articulate thoughts swiftly and coherently through typing serves as a cornerstone of effective digital communication in contemporary society. Whether drafting detailed reports, engaging in real-time conversations, or composing creative content, individuals must rely on their typing proficiency toconvey ideas with clarity and precision.",
      "The juxtaposition of accuracy and velocity in typing creates a paradox wherein increased haste often precipitates a decline in precision, thereby necessitating a delicate balance cultivated through disciplined and consistent practice. As typists strive to improve their performance, they must consciously refine muscle memory, minimize errors, and develop a rhythmic flow that allows for both speed and correctness.",
      "Advanced computational systems, including artificial intelligence models and complex data-processing algorithms, rely heavily on accurate human input during their development and operation. Even minor typographical errors can lead to significant discrepancies, underscoring the importance of precision in every keystroke."
    ],
 };

    const DURATION = 60;

    let phase     = "idle";   
    let sampleText = "";
    let timeLeft  = DURATION;
    let elapsed   = 0;
    let timer     = null;
    const params = new URLSearchParams(window.location.search);
    let difficulty = params.get("difficulty") || "easy";

    const input       = document.getElementById("input");
    const textChars   = document.getElementById("text-chars");
    const hint        = document.getElementById("hint");
    const wpmDisplay  = document.getElementById("wpm-display");
    const accDisplay  = document.getElementById("acc-display");
    const timeDisplay = document.getElementById("time-display");
    const progress    = document.getElementById("progress");
    const stopBtn     = document.getElementById("stop-btn");
    const resultCard  = document.getElementById("result-card");

    function getRandomText() {
      const list = TEXTS[difficulty];
      return list[Math.floor(Math.random() * list.length)];
    }

    function calcStats(typed) {
      const words    = typed.trim().split(/\s+/).filter(Boolean).length;
      const mins     = Math.max(elapsed, 1) / 60;
      const wpm      = Math.round(words / mins);
      let correct    = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === sampleText[i]) correct++;
      }
      const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
      return { wpm, accuracy, correct, total: typed.length };
    }

    function renderText(typed) {
      textChars.innerHTML = "";
      for (let i = 0; i < sampleText.length; i++) {
        const span = document.createElement("span");
        span.textContent = sampleText[i];
        if (i < typed.length) {
          span.className = typed[i] === sampleText[i] ? "char-correct" : "char-wrong";
        } else if (i === typed.length) {
          span.className = "char-cursor";
        } else {
          span.className = "char-pending";
        }
        textChars.appendChild(span);
      }
    }

    function updateStats(typed) {
      const s = calcStats(typed);
      wpmDisplay.textContent = s.wpm;
      accDisplay.textContent = s.accuracy + "%";
      return s;
    }

    function endTest() {
      if (phase === "done") return;
      clearInterval(timer);
      phase = "done";

      const typed = input.value;
      const s     = calcStats(typed);

      document.getElementById("result-wpm").innerHTML    = `${s.wpm} <span>wpm</span>`;
      document.getElementById("res-acc").textContent     = s.accuracy + "%";
      document.getElementById("res-correct").textContent = s.correct;
      document.getElementById("res-total").textContent   = s.total;

      const msgs = {
        80: "excellent — you're a speed demon!",
        60: "solid! well above average.",
        40: "good pace. keep practicing!",
        0:  "keep going — practice makes perfect.",
      };
      const key = s.wpm >= 80 ? 80 : s.wpm >= 60 ? 60 : s.wpm >= 40 ? 40 : 0;
      document.getElementById("result-msg").textContent = msgs[key];

      if (s.wpm >= 60) {
        document.getElementById("result-wpm").classList.add("fast");
        resultCard.classList.add("fast");
      }

      resultCard.classList.add("show");
      input.disabled = true;
      stopBtn.style.display = "none";
      progress.style.width  = "100%";
    }

    function startTimer() {
      timer = setInterval(() => {
        elapsed++;
        timeLeft--;

        timeDisplay.textContent = timeLeft + "s";
        if (timeLeft <= 10) {
          timeDisplay.style.color = "#ff6b6b";
          progress.style.background = "#ff6b6b";
        }

        const pct = ((DURATION - timeLeft) / DURATION) * 100;
        progress.style.width = pct + "%";

        updateStats(input.value);

        if (timeLeft <= 0) endTest();
      }, 1000);
    }

    input.addEventListener("input", () => {
      if (phase === "done") return;

      const typed = input.value;

      if (phase === "idle") {
        phase = "typing";
        hint.style.display  = "none";
        stopBtn.style.display = "inline-block";
        startTimer();
      }

      renderText(typed);
      updateStats(typed);

      if (typed.length >= sampleText.length) endTest();
    });

function restart() {
  clearInterval(timer);
  phase    = "idle";
  timeLeft = DURATION;
  elapsed  = 0;

  sampleText = getRandomText();

  input.value             = "";
  input.disabled          = false;
  wpmDisplay.textContent  = "0";
  accDisplay.textContent  = "100%";
  timeDisplay.textContent = "60s";
  timeDisplay.style.color = "";
  progress.style.width      = "0%";
  progress.style.background = "#7eb8ff";
  hint.style.display        = "none";   
  stopBtn.style.display     = "none";

  resultCard.classList.remove("show", "fast");
  document.getElementById("result-wpm").classList.remove("fast");

  renderText("");
  input.focus();
}

    restart();