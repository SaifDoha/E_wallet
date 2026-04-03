import {
  getbeneficiaries,
  finduserbyaccount,
  findbeneficiarieByid,
} from "../Model/database.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM chargé");

  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  console.log("User récupéré :", user);

  // ===================== GUARD =====================
  if (!user) {
    alert("User not authenticated");
    window.location.href = "/src/View/";
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
  const sourceCardSelect = document.getElementById("sourceCard");
  const transferForm = document.getElementById("transferForm");

  const topupBtn = document.getElementById("quickTopup");
  const topupSection = document.getElementById("topupPopup");
  const closeTopupBtn = document.getElementById("closeTopupBtn");
  const cancelTopupBtn = document.getElementById("cancelTopupBtn");
  const topupCard = document.getElementById("topupCard");
  const topupForm = document.getElementById("topupForm");

  console.log("🔍 Éléments DOM Transfert :", {
    transferBtn,
    transferSection,
    closeTransferBtn,
    cancelTransferBtn,
    beneficiarySelect,
    sourceCardSelect,
    transferForm,
  });

  // ===================== EVENTS =====================
  if (transferBtn) transferBtn.addEventListener("click", openTransfer);
  else console.warn("transferBtn introuvable dans le DOM");

  if (closeTransferBtn)
    closeTransferBtn.addEventListener("click", closeTransfer);
  else console.warn("closeTransferBtn introuvable dans le DOM");

  if (cancelTransferBtn)
    cancelTransferBtn.addEventListener("click", closeTransfer);
  else console.warn("ancelTransferBtn introuvable dans le DOM");

  if (transferForm) transferForm.addEventListener("submit", handleTransfer);
  else console.warn("transferForm introuvable dans le DOM");

  if (topupBtn) topupBtn.addEventListener("click", openTopup);
  else console.warn("topupBtn introuvable dans le DOM");

  if (closeTopupBtn) closeTopupBtn.addEventListener("click", closeTopup);
  else console.warn("closeTopupBtn introuvable dans le DOM");

  if (cancelTopupBtn) cancelTopupBtn.addEventListener("click", closeTopup);
  else console.warn("cancelTopupBtn introuvable dans le DOM");

  if (topupForm) topupForm.addEventListener("submit", handleTopup);
  else console.warn("topupForm introuvable dans le DOM");

  // ===================== DASHBOARD =====================
  const getDashboardData = () => {
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
  };

  function renderDashboard() {
    console.log("renderDashboard appelé");
    const dashboardData = getDashboardData();
    if (dashboardData) {
      greetingName.textContent = dashboardData.userName;
      currentDate.textContent = dashboardData.currentDate;
      solde.textContent = dashboardData.availableBalance;
      incomeElement.textContent = dashboardData.monthlyIncome;
      expensesElement.textContent = dashboardData.monthlyExpenses;
      activecards.textContent = dashboardData.activeCards;
    }

    transactionsList.innerHTML = "";
    user.wallet.transactions.forEach((transaction) => {
      const transactionItem = document.createElement("div");
      transactionItem.className = "transaction-item";

      let html = `
        <div>${transaction.date}</div>
        <div>${transaction.amount} MAD</div>
        <div>${transaction.type}</div>
      `;
      if (transaction.category === "RECHARGE") {
        html += `
          <div>${transaction.category}</div>
          <div>${transaction.status}</div>
        `;
      }

      transactionItem.innerHTML = html;
      transactionsList.appendChild(transactionItem);
    });
  }
  renderDashboard();

  // ===================== POPUP TRANSFERT =====================

  function openTransfer() {
    console.log("openTransfer");
    transferSection.classList.add("active");
    document.body.classList.add("popup-open");
  }

  function closeTransfer() {
    console.log("loseTransfer");
    transferSection.classList.remove("active");
    document.body.classList.remove("popup-open");
  }

  const beneficiaries = getbeneficiaries(user.id);
  console.log("Bénéficiaires :", beneficiaries);

  function renderBeneficiaries() {
    beneficiaries.forEach((beneficiary) => {
      const option = document.createElement("option");
      option.value = beneficiary.id;
      option.textContent = beneficiary.name;
      beneficiarySelect.appendChild(option);
    });
  }
  renderBeneficiaries();

  function renderCardsForTransfer() {
    sourceCardSelect.innerHTML = "";
    user.wallet.cards.forEach((card) => {
      const option = document.createElement("option");
      const last4 = card.numcards.slice(-4);
      option.value = card.numcards;
      option.textContent = `${card.type} **** ${last4}`;
      sourceCardSelect.appendChild(option);
    });
  }
  renderCardsForTransfer();

  // ===================== TRANSFER =====================

  function checkUser(numcompte) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const destinataire = finduserbyaccount(numcompte);
        if (destinataire) {
          resolve(destinataire);
        } else {
          reject("Destinataire non trouvé");
        }
      }, 500);
    });
  }

  function checkSolde(exp, amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const solde = exp.wallet.balance;
        if (solde >= amount) {
          resolve("Solde suffisant");
        } else {
          reject("Solde insuffisant");
        }
      }, 400);
    });
  }

  function updateSolde(exp, destinataire, amount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        exp.wallet.balance -= amount;
        destinataire.wallet.balance += amount;
        resolve("Solde mis à jour");
      }, 300);
    });
  }

  function addtransactions(exp, destinataire, amount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactionDebit = {
          id: Date.now(),
          type: "debit",
          amount: amount,
          from: exp.name,
          to: destinataire.name,
          date: new Date().toLocaleDateString(),
        };
        const transactionCredit = {
          id: Date.now() + 1,
          type: "credit",
          amount: amount,
          from: exp.name,
          to: destinataire.name,
          date: new Date().toLocaleDateString(),
        };
        exp.wallet.transactions.push(transactionDebit);
        destinataire.wallet.transactions.push(transactionCredit);
        renderDashboard();
        resolve("Transaction enregistrée");
      }, 200);
    });
  }

  async function transfer(expediteur, numcompte, amount) {
    console.log("transfer démarré :", {
      expediteur: expediteur.name,
      numcompte,
      amount,
    });
    try {
      const destinataire = await checkUser(numcompte);
      await checkSolde(expediteur, amount);
      await updateSolde(expediteur, destinataire, amount);
      await addtransactions(expediteur, destinataire, amount);
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      console.log("transfer réussi — sessionStorage mis à jour");
      alert("Transfert réussi");
      renderDashboard();
      closeTransfer();
      transferForm.reset();
    } catch (error) {
      console.error("transfer échoué :", error);
      alert(error);
    }
  }

  function handleTransfer(e) {
    e.preventDefault();
    const beneficiaryId = document.getElementById("beneficiary").value;
    const benef = findbeneficiarieByid(user.id, beneficiaryId);
    if (!benef) {
      alert("Bénéficiaire introuvable");
      return;
    }
    const beneficiaryAccount = benef.account;
    const amount = Number(document.getElementById("amount").value);
    transfer(user, beneficiaryAccount, amount);
  }

  // ===================== POPUP RECHARGEMENT =====================

  const TOPUP_MIN = 10;
  const TOPUP_MAX = 50000;

  function openTopup() {
    topupSection.classList.add("active");
    document.body.classList.add("popup-open");
    renderCardForTopup();
  }

  function closeTopup() {
    topupSection.classList.remove("active");
    document.body.classList.remove("popup-open");
    topupForm.reset();
  }

  function renderCardForTopup() {
    topupCard.innerHTML = "";
    user.wallet.cards.forEach((card) => {
      const option = document.createElement("option");
      const last4 = card.numcards.slice(-4);
      option.value = card.numcards;
      option.textContent = `${card.type} **** ${last4}`;
      topupCard.appendChild(option);
    });
  }

  function isCardExpired(card) {
    const today = new Date();
    const expiryDate = new Date(card.expiry);
    const expired = today > expiryDate;
    console.log("isCardExpired ");
    return expired;
  }

  function validMontant(card, amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount <= 0) {
          reject("Le montant doit être supérieur à zéro");
          return;
        }
        if (amount < TOPUP_MIN) {
          reject(`Le montant minimum est de ${TOPUP_MIN} MAD`);
          return;
        }
        if (amount > TOPUP_MAX) {
          reject(`Le montant maximum est de ${TOPUP_MAX} MAD`);
          return;
        }
        if (card.balance < amount) {
          reject("Solde insuffisant sur cette carte");
          return;
        }
        if (isCardExpired(card)) {
          reject("Carte expirée");
          return;
        }
        resolve(amount);
      }, 300);
    });
  }

  function executerRecharge(card, amount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        card.balance -= amount;
        user.wallet.balance += amount;
        renderDashboard();
        resolve("Solde mis à jour");
      }, 300);
    });
  }

  function addRechargeTransaction(card, amount, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transaction = {
          id: Date.now(),
          type: "credit",
          category: "RECHARGE",
          amount: amount,
          from: card.numcards,
          to: user.account,
          date: new Date().toLocaleDateString(),
          status: status,
        };
        user.wallet.transactions.push(transaction);
        renderDashboard();
        resolve();
      }, 200);
    });
  }

  async function recharge(card, amount) {
    try {
      await validMontant(card, amount);
      await executerRecharge(card, amount);
      await addRechargeTransaction(card, amount, "success");
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      renderDashboard();
      alert("Recharge effectuée avec succès !");
      closeTopup();
      topupForm.reset();
    } catch (error) {
      console.error("recharge échouée :", error);
      await addRechargeTransaction(card, amount, "failed");
      alert("Échec de la recharge : " + error);
    }
  }

  function handleTopup(e) {
    e.preventDefault();
    const cardNum = topupCard.value;
    const card = user.wallet.cards.find((c) => c.numcards === cardNum);
    const amount = Number(document.getElementById("topupAmount").value);
    if (!card) {
      alert("Carte non trouvée");
      return;
    }
    if (!amount || amount <= 0) {
      alert("Montant invalide");
      return;
    }
    recharge(card, amount);
  }
});
