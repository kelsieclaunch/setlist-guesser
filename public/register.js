document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginBox = document.querySelector(".form-box.login");
  const registerBox = document.querySelector(".form-box.register");

  // Ensure login box is active on page load
  loginBox.classList.add("active");
  registerBox.classList.remove("active");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = registerForm.username.value.trim();
    const password = registerForm.password.value;
    const verifyPassword = registerForm.verifyPassword.value;

    if (password !== verifyPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        // Automatically log the user in
        const loginRes = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        });

        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.message === "Login successful") {
          window.location.href = "home.html";
        } else {
          alert("Registration succeeded but login failed. Please log in manually.");
        }
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  // Toggle forms using the "active" class
  document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();
    registerBox.classList.remove("active");
    loginBox.classList.add("active");
  });

  document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    loginBox.classList.remove("active");
    registerBox.classList.add("active");
  });
});
