const surpriseSongs = [
  "Last Heaven",
  "Sorry As I'll Ever Be",
  "Lemonade",
  "Perfect Posture",
  "Glitter Times",
  "Read My Mind",
  "LIFE IS PUKE (20,000)",
  "Teenage Jealousy",
  "Noise",
  "Play",
  "Beating Heart Baby",
  "rainy days in la",
  "Candy",
  "What We Do For Fun",
  "Fantastic",
  "They All Float",
  "Silver",
  "I Was Hiding Under Your Porch Because I Love You",
  "Bones of '92",
  "I'm a Natural Blue",
  "Night Maps",
  "New Wave",
  "Easter Egg",
  "American History",
  "Christmas",
  "No Capes",
  "Pink",
  "Territory",
  "Mad All The Time",
  "Crave",
  "I'll Always Be Around",
  "Plum Island",
  "It Follows",
  "Little Violence",
  "Powerless",
  "Dizzy",
  "Made in America",
  "Take Her to the Moon",
  "Royal",
  "Hawaii (Stay Awake)",
  "Sleep Alone",
  "Rare",
  "We Need to Talk",
  "11:11",
  "Zone Out",
  "Worst",
  "War Crimes",
  "Never Bloom Again",
  "Group Chat",
  "Easy To Hate",
  "Watch What Happens Next",
  "Cherry Red",
  "See You In In The Future",
  "Ice Bath",
  "Crying Over It All",
  "Magnetic",
  "Fruit Roll Ups",
  "You'd Be Paranoid Too",
  "American Graffiti",
  "The Secret Life of Me",
  "Just Kidding",
  "Snow Globe",
  "Violet!",
  "Numb",
  "Fuzzy",
  "Lowkey As Hell",
  "A Night Out On Earth",
  "Closer",
  "Ritual",
  "Self-Sabotage",
  "End of the Water (Feel)",
  "2 Best Friends",
  "Brainwashed",
  "ST*RFUCKER",
  "SOULSUCKER",
  "Talking to Myself",
  "Call Me Beep Me",
  "Forget",
  "give me a break!",
  "Gwen Stefani"
];


document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const quizSlug = urlParams.get("slug");
  const quizForm = document.getElementById("quizForm");
  const quizTitle = document.getElementById("quiz-title");

  let profile = null;

  // Define quiz questions 
  const quizQuestions = {
    default: {
      title: "Quiz",
      questions: [
        { q: "1. Peach or Telephone?", name: "q1", type: "radio", options: ["Peach", "Telephone"] },
        { q: "2. Not Warriors or Gloom Boys?", name: "q2", type: "radio", options: ["Not Warriors", "Gloom Boys"] },
        { q: "3. Surprise Song #1", name: "q3", type: "text" },
        { q: "4. Surprise Song #2", name: "q4", type: "text" },
        { q: "5. Surprise Song #3", name: "q5", type: "text" },
        { q: "6. Lucky People or 21 Questions?", name: "q6", type: "radio", options: ["Lucky People", "21 Questions"] },
        { q: "7. Reboot or Tantrum?", name: "q7", type: "radio", options: ["Reboot", "Tantrum"] }
      ]
    }
  };

  // specific quiz titles
  const quizTitles = {
    norfolk: "Norfolk 11/15",
    philadelphia: "Philadelphia 11/16",
    brooklyn: "Brooklyn 11/18",
    boston: "Boston 11/20",
    sayreville: "Sayreville 11/22",
    toronto: "Toronto 11/23",
    pittsburgh: "Pittsburgh 11/25",
    detroit: "Detroit 11/26",
    chicago: "Chicago 11/28",
    columbus: "Columbus 11/29",
    stlouis: "St Louis 12/2",
    denver: "Denver 12/4",
    saltlakecity: "Salt Lake City 12/6",
    seattle: "Seattle 12/8",
    portland: "Portland 12/9",
    sanfrancisco: "San Francisco 12/12",
    sacramento: "Sacramento 12/13",
    lasvegas: "Las Vegas 12/15",
    phoenix: "Phoenix 12/17",
    losangeles: "Los Angeles 12/18"

  };

  // --- Check login ---
  async function checkLogin() {
    try {
      const res = await fetch("/profile", { credentials: "include" });
      if (!res.ok) return window.location.href = "/";
      profile = await res.json();
    } catch {
      window.location.href = "/";
    }
  }

  // --- Render form dynamically ---
  function renderQuizForm() {
    const title = quizTitles[quizSlug] || quizTitles.default || "Quiz";
    quizTitle.textContent = title;

    // Update alert
    const updateNote = document.createElement("p");
    updateNote.textContent = "Update: try rolling the dice to generate a random guess";
    updateNote.style.fontStyle = "italic";
    updateNote.style.color = "#d63384"; // pink
    updateNote.style.fontSize = "0.9rem";
    updateNote.style.marginTop = "4px";
    quizTitle.insertAdjacentElement("afterend", updateNote);

    quizForm.innerHTML = ""; // Clear existing

    const questions = quizQuestions.default.questions;

    questions.forEach(q => {
      const div = document.createElement("div");
      div.className = "input-box";

      if (q.type === "radio") {
        const p = document.createElement("p");
        p.textContent = q.q;
        div.appendChild(p);

        q.options.forEach(opt => {
          const label = document.createElement("label");
          const input = document.createElement("input");
          input.type = "radio";
          input.name = q.name;
          input.value = opt;
          input.required = true;
          label.appendChild(input);
          label.append(opt);
          div.appendChild(label);
        });
      } else if (q.type === "text") {
        const wrapper = document.createElement("div");
        wrapper.className = "surprise-wrapper";

        const label = document.createElement("label");
        label.setAttribute("for", q.name);
        label.textContent = q.q;

        const input = document.createElement("input");
        input.type = "text";
        input.name = q.name;
        input.id = q.name;
        input.placeholder = "Enter your guess";
        input.className = "surprise-input";

        const diceBtn = document.createElement("button");
        diceBtn.type = "button";
        diceBtn.className = "dice-btn";
        diceBtn.innerHTML = `<ion-icon name="dice"></ion-icon>`;

        wrapper.appendChild(input);
        wrapper.appendChild(diceBtn);

        div.appendChild(label);
        div.appendChild(wrapper);
      }

      quizForm.appendChild(div);
    });

    // Add submit button
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Submit Guesses";
    quizForm.appendChild(submitBtn);
  }

  // handle logout
  const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
        const res = await fetch('/logout', { method: 'POST', credentials: 'include' });
        const data = await res.json();

        if (res.ok) {
            console.log('Logged out:', data.message);
            profile = null; // clear local profile
            window.location.href = '/'; // redirect to login page
        } else {
            alert(data.message || 'Logout failed.');
        }
        } catch (err) {
        console.error('Logout error:', err);
        alert('Error logging out.');
        }
  });
}

  function getRandomNonDuplicateSong(currentInput, allInputs) {
    // Get songs used in other inputs
    const usedInOtherInputs = Array.from(allInputs)
      .filter(input => input !== currentInput)
      .map(input => input.value.trim())
      .filter(val => val !== "");

    const availableSongs = surpriseSongs.filter(song => !usedInOtherInputs.includes(song));

    if (availableSongs.length === 0) return currentInput.value;

    return availableSongs[Math.floor(Math.random() * availableSongs.length)];
  }

  // Dice button click handler
  document.addEventListener("click", function (e) {
    if (e.target.closest(".dice-btn")) {
      const input = e.target.closest(".surprise-wrapper").querySelector(".surprise-input");
      const allInputs = document.querySelectorAll(".surprise-input");

      input.value = getRandomNonDuplicateSong(input, allInputs);
      input.focus();
    }
  });


  // --- Handle submission ---
  quizForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(quizForm).entries());

    try {
      const res = await fetch(`/quiz/${quizSlug}/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const json = await res.json();

      if (res.ok) {
        alert("Guesses Received!");
        window.location.href = "/home.html";
      } else {
        alert(json.message || "Error submitting quiz.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting quiz.");
    }
  });


  await checkLogin();
  renderQuizForm();
});



