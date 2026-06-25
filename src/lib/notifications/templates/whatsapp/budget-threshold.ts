const template = {
  subject: "Budget Alert",
  body: `Hi {{pmName}},

The project {{projectName}} has used {{usedPercent}}% of its budget ({{currency}} {{usedAmount}} of {{currency}} {{budget}}).

Please review spending.

— Pulse`,
};

export default template;
