const database = {
  users: [
    {
      id: "1",
      name: "Ali",
      email: "Ali@example.com",
      password: "1232",

      wallet: {
        balance: 12457,
        currency: "MAD",

        cards: [
          {
            numcards: "124847",
            type: "visa",
            balance: 14712,
            expiry: "14-08-27",
            vcc: "147",
          },
          {
            numcards: "124478",
            type: "mastercard",
            balance: 1470,
            expiry: "14-08-28",
            vcc: "257",
          },
        ],

        transactions: [
          {
            id: "1",
            type: "credit",
            amount: 140,
            date: "14-08-25",
            from: "Ahmed",
            to: "124847",
          },
          {
            id: "2",
            type: "debit",
            amount: 200,
            date: "13-08-25",
            from: "124847",
            to: "Amazon",
          },
        ],
      },
    },

    {
      id: "2",
      name: "Ahmed",
      email: "Ahmed@example.com",
      password: "1111",

      wallet: {
        balance: 8200,
        currency: "MAD",

        cards: [
          {
            numcards: "987654",
            type: "visa",
            balance: 8200,
            expiry: "10-09-28",
            vcc: "852",
          },
        ],

        transactions: [
          {
            id: "3",
            type: "credit",
            amount: 250,
            date: "12-08-25",
            from: "Ali",
            to: "987654",
          },
        ],
      },
    },
  ],
};
const finduserbymail = (mail, password) => {
  return database.users.find(
    (u) => u.email === mail && u.password === password,
  );
};

export default finduserbymail;

export const findUserByName = (name) => {
  return database.users.find((u) => u.name === name);
};

export const findCard = (user, cardNumber) => {
  return user.wallet.cards.find((c) => c.numcards === cardNumber);
};
