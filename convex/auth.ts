import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";

const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15,
  async generateVerificationToken() {
    const alphabet = "0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
  },
  async sendVerificationRequest({ identifier: email, token }) {
    // In production, integrate with email provider
    // For now, log the OTP
    console.log(`[OTP] Sending code ${token} to ${email}`);
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, emailOtp],
});
