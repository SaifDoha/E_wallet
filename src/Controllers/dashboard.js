import {
  getbeneficiaries,
  finduserbyaccount,
  findbeneficiarieByid,
} from "../Model/database.js";

const user = JSON.parse(sessionStorage.getItem("currentUser"));

// ===================== GUARD =====================
if (!user) {
  alert("User not authenticated");
  window.location.href = "/index.html";
}

// ===================== DOM =====================
const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");

const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");

const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const transferForm = document.getElementById("transferForm");

// ===================== EVENTS =====================
transferBtn.addEventListener("click", openTransfer);
closeTransferBtn.addEventListener("click", closeTransfer);
cancelTransferBtn.addEventListener("click", closeTransfer);
transferForm.addEventListener("submit", handleTransfer);

// ===================== DASHBOARD =====================
function getDashboardData() {
  const monthlyIncome = user.wallet.transactions
    .filter((t) => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter((t) => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} MAD`,
    monthlyExpenses: `${monthlyExpenses} MAD`,
  };
}

function renderDashboard() {
  const data = getDashboardData();

  greetingName.textContent = data.userName;
  currentDate.textContent = data.currentDate;
  solde.textContent = data.availableBalance;
  incomeElement.textContent = data.monthlyIncome;
  expensesElement.textContent = data.monthlyExpenses;
  activecards.textContent = data.activeCards;

  transactionsList.innerHTML = "";

  user.wallet.transactions.forEach((t) => {
    const div = document.createElement("div");
    div.className = "transaction-item";

    div.innerHTML = `
      <div>${t.date}</div>
      <div>${t.amount} MAD</div>
      <div>${t.type}</div>
    `;

    transactionsList.appendChild(div);
  });
}

renderDashboard();

// ===================== POPUP =====================
function openTransfer() {
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
}

function closeTransfer() {
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

// ===================== BENEFICIARIES =====================
const beneficiaries = getbeneficiaries(user.id);

function renderBeneficiaries() {
  beneficiaries.forEach((b) => {
    const option = document.createElement("option");
    option.value = b.id;
    option.textContent = b.name;
    beneficiarySelect.appendChild(option);
  });
}
renderBeneficiaries();

function renderCards() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type + " **** " + card.numcards;
    sourceCard.appendChild(option);
  });
}
renderCards();

// ===================== PROMISE FUNCTIONS =====================
function checkUser(numcompte) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const beneficiary = finduserbyaccount(numcompte);
      beneficiary ? resolve(beneficiary) : reject("Beneficiary not found");
    }, 800);
  });
}

function checkSolde(expediteur, amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      expediteur.wallet.balance >= amount
        ? resolve()
        : reject("Insufficient balance");
    }, 800);
  });
}

function updateSolde(expediteur, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      expediteur.wallet.balance -= amount;
      destinataire.wallet.balance += amount;
      resolve();
    }, 400);
  });
}

function addtransactions(expediteur, destinataire, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const credit = {
        id: Date.now(),
        type: "credit",
        amount,
        date: new Date().toLocaleString(),
        from: expediteur.name,
      };

      const debit = {
        id: Date.now() + 1,
        type: "debit",
        amount,
        date: new Date().toLocaleString(),
        to: destinataire.name,
      };

      expediteur.wallet.transactions.push(debit);
      destinataire.wallet.transactions.push(credit);

      resolve();
    }, 800);
  });
}

// ===================== TRANSFER =====================
function transfer(expediteur, numcompte, amount) {
  checkUser(numcompte)
    .then((destinataire) => {
      return checkSolde(expediteur, amount).then(() => destinataire);
    })
    .then((destinataire) => {
      return updateSolde(expediteur, destinataire, amount).then(
        () => destinataire,
      );
    })
    .then((destinataire) => {
      return addtransactions(expediteur, destinataire, amount);
    })
    .then(() => {
      alert("Transfert réussi");
      renderDashboard();
      closeTransfer();
    })
    .catch((err) => {
      alert(err);
      console.error(err);
    });
}

// ===================== HANDLE TRANSFER =====================
function handleTransfer(e) {
  e.preventDefault();

  const beneficiaryId = beneficiarySelect.value;
  const beneficiary = findbeneficiarieByid(user.id, beneficiaryId);

  if (!beneficiary) {
    alert("Beneficiary not found");
    return;
  }

  const amount = Number(document.getElementById("amount").value);

  if (amount <= 0) {
    alert("Montant invalide");
    return;
  }

  transfer(user, beneficiary.account, amount);
}
