document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginBox = document.querySelector(".form-box.login");
  const registerBox = document.querySelector(".form-box.register");

  // Make sure login form does not reload the page
  loginForm.setAttribute("action", "javascript:void(0)");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent default reload

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      const data = await res.json();

      if (data.message === "Login successful") {
        window.location.assign("home.html");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Error logging in. Please try again.");
    }
  });

  // Toggle forms using the "active" class
  document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    loginBox.classList.remove("active");
    registerBox.classList.add("active");
  });

  document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();
    registerBox.classList.remove("active");
    loginBox.classList.add("active");
  });
});
