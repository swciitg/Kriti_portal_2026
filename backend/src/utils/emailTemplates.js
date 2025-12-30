export function passwordResetEmail({ resetLink }) {
  return `
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        background-color: #f6f7f9;
                        padding: 16px;
                        color: #111;
                    }
                    .content {
                        max-width: 520px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px 22px;
                    }
                    h2 {
                        margin-top: 0;
                        font-size: 18px;
                        font-weight: normal;
                    }
                    p {
                        font-size: 14px;
                        line-height: 1.6;
                        margin: 12px 0;
                    }
                    .btn-wrapper {
                        text-align: center;
                        margin: 20px 0;
                    }
                    .btn {
                        display: inline-block;
                        padding: 10px 16px;
                        background-color: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        font-size: 14px;
                        border-radius: 3px;
                    }
                    .link-fallback {
                        font-size: 13px;
                        word-break: break-all;
                    }
                    .footer {
                        margin-top: 24px;
                        font-size: 12px;
                        color: #555;
                    }
                </style>
            </head>
            <body>

            <div class="content">
                <h2>Password reset request</h2>

                <p>
                    We received a request to reset the password for your
                    <strong>Kriti Portal</strong> account.
                </p>

                <p>
                    Click the button below to continue. This link will expire in
                    <strong>5 minutes</strong>.
                </p>

                <div class="btn-wrapper">
                    <a href="${resetLink}" class="btn">Reset password</a>
                </div>

                <p>
                    If you didn’t request this, you can safely ignore this email.
                </p>

                <div class="footer">
                    This is an automated message from Kriti Portal. Please do not reply.
                </div>
            </div>

            </body>
            </html>

    `;
}

export function wrongEmailTemplate() {
  return `
    <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        background-color: #f6f7f9;
                        padding: 16px;
                        color: #111;
                    }
                    .content {
                        max-width: 520px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px 22px;
                    }
                    h2 {
                        margin-top: 0;
                        font-size: 18px;
                        font-weight: normal;
                    }
                    p {
                        font-size: 14px;
                        line-height: 1.6;
                        margin: 12px 0;
                    }
                    .notice {
                        background-color: #f9fafb;
                        border-left: 3px solid #9ca3af;
                        padding: 10px 12px;
                        margin: 16px 0;
                        font-size: 13px;
                    }
                    .footer {
                        margin-top: 24px;
                        font-size: 12px;
                        color: #555;
                    }
                </style>
            </head>
            <body>

            <div class="content">
                <h2>Password reset attempt</h2>

                <p>
                    A request was made to reset the password for this email address, but
                    no <strong>Kriti Portal</strong> account is associated with it.
                </p>

                <div class="notice">
                    If you believe this is a mistake, please contact the
                    <strong>Kriti Convener</strong> for assistance.
                </div>

                <p>
                    No action is required from you if you did not make this request.
                </p>

                <div class="footer">
                    This is an automated message from Kriti Portal. Please do not reply.
                </div>
            </div>

            </body>
        </html>

`;
}
