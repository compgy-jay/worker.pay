const template = {
  subject: "Welcome to Pulse, {{name}}!",
  body: `<h1>Welcome to Pulse</h1>
<p>Hi {{name}},</p>
<p>Your Pulse account has been created. You can now manage your construction projects, track labor costs, and monitor budgets.</p>
<p><a href="{{dashboardUrl}}">Go to Dashboard</a></p>
<p>— The Pulse Team</p>`,
};

export default template;
