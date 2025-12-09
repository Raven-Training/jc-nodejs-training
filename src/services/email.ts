import nodemailer, { Transporter } from 'nodemailer';

import config from '../config/config';

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
    });
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: 'Welcome to Pokémon Teams',
        html: this.getWelcomeEmailTemplate(userName),
      });
      console.log(`Welcome email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Error sending welcome email to ${to}:`, error);
    }
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Pokémon Teams</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #ff6b6b;
          }
          .header h1 {
            color: #ff6b6b;
            margin: 0;
          }
          .content {
            padding: 20px 0;
          }
          .content h2 {
            color: #333;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ff6b6b;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Pokémon Teams</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>
              We're excited to have you with us! Your account has been successfully created 
              and you can now start building your Pokémon teams.
            </p>
            <p>
              With Pokémon Teams you can:
            </p>
            <ul>
              <li>Create and manage your favorite Pokémon teams</li>
              <li>Acquire new Pokémon for your collection</li>
              <li>Organize your Pokémon into strategic teams</li>
              <li>And much more...</li>
            </ul>
            <p>
              Let your adventure begin!
            </p>
          </div>
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; 2025 Pokémon Teams. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
