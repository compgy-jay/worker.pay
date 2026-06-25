const template = {
  subject: "Budget Alert — {{projectName}}",
  body: `<h1>Budget Threshold Reached</h1>
<p>Hi {{pmName}},</p>
<p>The project <strong>{{projectName}}</strong> has used <strong>{{usedPercent}}%</strong> of its budget ({{currency}} {{usedAmount}} of {{currency}} {{budget}}).</p>
<p>Please review your spending.</p>
<p>— The Pulse Team</p>`,
};

export default template;
