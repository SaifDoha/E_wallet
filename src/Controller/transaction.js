import { findUserByName, findCard } from "./database.js";

const currentuser = JSON.parse(sessionStorage.getItem("currentuser"));
if (!currentuser) window.location.href = "/src/Views/login.html";

const form = document.getElementById("transactionForm");
const Valide = document.getElementById("Valide");

form.addEventListener("submit", handelTrans);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handelTrans(event) {
  event.preventDefault();

  const beneficiaryName = document.getElementById("beneficiary").value;
  const sourceCardNum = document.getElementById("sourceCard").value;
  const type = document.getElementById("transactionType").value;
  const amount = parseFloat(document.getElementById("amount").value);

  let beneficiary, card, transaction;

  // Étape 1 : vérifier bénéficiaire
  Valide.textContent = "Vérification du bénéficiaire...";
  setTimeout(() => {
    beneficiary = findUserByName(beneficiaryName);
    if (!beneficiary) {
      Valide.textContent = "Bénéficiaire invalide";
      return;
    }
    Valide.textContent = "Bénéficiaire valide...";

    // Étape 2 : vérifier la carte et le solde
    setTimeout(() => {
      card = currentuser.wallet.cards.find((c) => c.numcards === sourceCardNum);
      if (!card) {
        Valide.textContent = "Carte inexistante";
        return;
      }
      if (type === "debit" && card.balance < amount) {
        Valide.textContent = "Solde insuffisant";
        return;
      }
      Valide.textContent = "Solde vérifié...";

      // Étape 3 : création de la transaction
      setTimeout(() => {
        transaction = {
          id: getRandomInt(1, 1000),
          type: type,
          amount: amount,
          date: new Date().toLocaleString(),
          from: type === "debit" ? sourceCardNum : beneficiaryName,
          to: type === "debit" ? beneficiaryName : sourceCardNum,
        };
        Valide.textContent = "Transaction créée...";
        currentuser.wallet.transactions.push(transaction);

        // Étape 4 : appliquer la transaction
        setTimeout(() => {
          if (transaction.type === "debit") {
            card.balance -= transaction.amount;
            currentuser.wallet.balance -= transaction.amount;
          } else {
            card.balance += transaction.amount;
            currentuser.wallet.balance += transaction.amount;
          }
          //mettre à jour la session
          sessionStorage.setItem("currentuser", JSON.stringify(currentuser));
          Valide.textContent = "Transaction appliquée avec succès !";
          console.log(transaction);
        }, 2000);
      }, 1000);
    }, 1000);
  }, 1000);
}
