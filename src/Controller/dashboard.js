// Récupération de l'utilisateur connecté
const currentuser = JSON.parse(sessionStorage.getItem("currentuser"));

// Redirection si aucun utilisateur
if (!currentuser) {
  window.location.href = "/src/Views/login.html";
} else {
  console.log(currentuser);
}

// Récupération des éléments du DOM
const greetingName = document.getElementById("greetingName");
const availableBalance = document.getElementById("availableBalance");
const monthlyIncome = document.getElementById("monthlyIncome");
const monthlyExpenses = document.getElementById("monthlyExpenses");
const activeCards = document.getElementById("activeCards");

// Affichage des informations
greetingName.textContent = currentuser.name;
availableBalance.textContent =
  currentuser.wallet.balance + " " + currentuser.wallet.currency;
activeCards.textContent = currentuser.wallet.cards.length;

// Calcul des revenus et dépenses
let totalDebits = currentuser.wallet.transactions.reduce((total, t) => {
  if (t.type === "debit") {
    return total + t.amount;
  } else {
    return total;
  }
}, 0); // 0 est la valeur initiale de total

let totalCredits = currentuser.wallet.transactions.reduce((total, t) => {
  if (t.type === "credit") {
    return total + t.amount;
  } else {
    return total;
  }
}, 0); // 0 est la valeur initiale de total

// Affichage dans le DOM
monthlyIncome.textContent = totalCredits + " " + currentuser.wallet.currency;
monthlyExpenses.textContent = totalDebits + " " + currentuser.wallet.currency;

//TRANSFERE:

var quickTransfer = document.getElementById("quickTransfer");
quickTransfer.addEventListener("click", handleTransf);

function handleTransf() {
  window.location.href = "/src/Views/info_transfere.html";
}
