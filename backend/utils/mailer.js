import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function generateTraineeId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `NLNG/T/${randomNum}`;
}

export function buildEmailTemplate(user) {
  const { first_name, last_name, email, role, trainee_id, password_plain } = user;
  const greeting = first_name ? `Dear ${first_name} ${last_name || ""},` : "Dear User,";
  const year = new Date().getFullYear(); // 👈 Get current year dynamically

  const credentials =
    role === "trainee"
      ? `
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password_plain}</p>
        <p><strong>Trainee ID:</strong> ${trainee_id}</p>
      `
      : `
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password_plain}</p>
      `;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NLNG LMS Account Created</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #e9f2f5; font-family: Arial, sans-serif;">
    <div style="padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">

        <!-- Header / Logo -->
        <div style="text-align:center; margin-bottom:25px;">
          <img src="https://mediatracnet.com/wp-content/uploads/2024/10/image561911.png"
               alt="NLNG Logo"
               style="width:110px; height:auto;" />
        </div>

        <!-- Title -->
        <h2 style="text-align:center; color:#0c4a6e; margin-bottom:15px;">
          NLNG Learning Management System
        </h2>

        <!-- Greeting & Body -->
        <p style="color:#333; font-size:15px; line-height:1.6;">${greeting}</p>
        <p style="color:#333; font-size:15px; line-height:1.6;">
          Your account has been successfully created on the NLNG LMS platform. Below are your login details:
        </p>

        <!-- Credentials -->
        <div style="background-color:#f9fafb; border:1px solid #e0e0e0; border-radius:8px; padding:15px; margin:20px 0;">
          ${credentials}
        </div>

        <!-- Instructions -->
        <p style="color:#333; font-size:15px; line-height:1.6;">
          You can now log in to the system and begin using the platform.
        </p>

        <!-- CTA -->
        <div style="text-align:center; margin-top:30px;">
          <a href="https://nlng-lms.com/login"
             style="background-color:#0b5ed7; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:6px; font-size:15px; display:inline-block;">
             Go to Login
          </a>
        </div>

        <!-- Footer -->
        <br/>
        <p style="font-size:13px; color:#555; text-align:center; line-height:1.4;">
          Best Regards,<br/>
          <strong>NLNG Learning Management System</strong><br/>
          © ${year} 
        </p>

      </div>
    </div>
  </body>
  </html>
  `;
}

export async function sendAccountEmail(user) {
  const html = buildEmailTemplate(user);

  const mailOptions = {
    from: `"NLNG LMS" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Your NLNG LMS Account Details",
    html,
  };

  await transporter.sendMail(mailOptions);
}
