import finduserbymail from "./database.js";

const mail = document.getElementById("mail");
const password = document.getElementById("password");
const submitbtn = document.getElementById("submitbtn");

submitbtn.addEventListener("click", handleLogin);

function handleLogin() {
  if (!mail.value || !password.value) {
    alert("CHAMPS INCOMPLET");
    return;
  }

  submitbtn.textContent = "Checking...";

  setTimeout(() => {
    const user = finduserbymail(mail.value, password.value);

    if (user) {
      // Stockage dans sessionStorage
      sessionStorage.setItem("currentuser", JSON.stringify(user));
      // Redirection vers le dashboard
      window.location.href = "/src/Views/dashboard.html";
    } else {
      alert("Identifiants incorrects");
      submitbtn.textContent = "Se connecter";
    }
  }, 1000);
}
