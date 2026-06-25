const template = {
  subject: "Wage Alert",
  body: `Hello {{workerName}},

Your wage of {{currency}} {{amount}} for the week starting {{weekStart}} has been recorded and marked as paid.

— Pulse`,
};

export default template;
