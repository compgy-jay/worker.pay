const template = {
  subject: "Wage Paid — {{workerName}}",
  body: `<h1>Wage Payment Confirmation</h1>
<p>Hi {{workerName}},</p>
<p>Your wage of <strong>{{currency}} {{amount}}</strong> for the week starting <strong>{{weekStart}}</strong> has been marked as paid.</p>
<p>— The Pulse Team</p>`,
};

export default template;
