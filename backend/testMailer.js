import { sendAccountEmail } from "./utils/mailer.js";

const testUser = {
  first_name: "Test",
  last_name: "User",
  email: "tonnysammy01@gmail.com", // 👈 replace with your test address
  role: "trainee",
  trainee_id: "NLNG/T/9999",
  password_plain: "12345",
};

sendAccountEmail(testUser)
  .then(() => console.log("✅ Test email sent successfully"))
  .catch((err) => console.error("❌ Error sending test email:", err));
