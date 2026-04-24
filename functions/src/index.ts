import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

admin.initializeApp();
const db = admin.firestore();

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const masked = local[0] + '***' + (local.length > 3 ? local[local.length - 1] : '');
    return `${masked}@${domain}`;
}

function createTransporter() {
    const gmailUser = functions.params.defineString('GMAIL_USER').value();
    const gmailPass = functions.params.defineString('GMAIL_PASS').value();
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
    });
}

// ─── sendOtp ────────────────────────────────────────────────────────────────

export const sendOtp = functions.https.onCall(async (request) => {
    const uid: string = request.auth?.uid ?? '';
    const email: string = request.data?.email ?? '';

    if (!uid || !email) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    // Rate-limit: check if there's a recent unexpired OTP (to prevent spam)
    const existingRef = db.collection('otpVerifications').doc(uid);
    const existing = await existingRef.get();
    if (existing.exists) {
        const data = existing.data()!;
        const createdAt: admin.firestore.Timestamp = data.createdAt;
        const secondsAgo = (Date.now() - createdAt.toMillis()) / 1000;
        if (secondsAgo < 60) {
            throw new functions.https.HttpsError(
                'resource-exhausted',
                `Please wait ${Math.ceil(60 - secondsAgo)} seconds before requesting a new OTP.`
            );
        }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 5 * 60 * 1000); // 5 min

    // Store hashed OTP
    await existingRef.set({
        otpHash,
        expiresAt,
        attempts: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        email,
    });

    // Send email
    const transporter = createTransporter();
    const gmailUser = functions.params.defineString('GMAIL_USER').value();

    await transporter.sendMail({
        from: `"Aarogyam 🌸" <${gmailUser}>`,
        to: email,
        subject: 'Your Aarogyam Verification Code',
        html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #FFF5F8; border-radius: 16px; border: 1px solid rgba(212,65,142,0.2);">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #D4418E; font-size: 28px; margin: 0;">🪷 Aarogyam</h1>
                <p style="color: #8B7B8B; margin-top: 4px;">Your wellness journey begins here</p>
            </div>
            <p style="color: #1A0A2E; font-size: 16px;">Hello! Here is your verification code:</p>
            <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 48px; font-weight: bold; letter-spacing: 14px; color: #D4418E; background: white; padding: 16px 24px; border-radius: 12px; border: 2px solid rgba(212,65,142,0.3); display: inline-block;">${otp}</span>
            </div>
            <p style="color: #8B7B8B; font-size: 14px; text-align: center;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <hr style="border: none; border-top: 1px solid rgba(212,65,142,0.15); margin: 24px 0;" />
            <p style="color: #c0b0b0; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email. 🌸</p>
        </div>
        `,
    });

    return { success: true, maskedEmail: maskEmail(email) };
});

// ─── verifyOtp ──────────────────────────────────────────────────────────────

export const verifyOtp = functions.https.onCall(async (request) => {
    const uid: string = request.auth?.uid ?? '';
    const enteredOtp: string = request.data?.otp ?? '';

    if (!uid || !enteredOtp) {
        throw new functions.https.HttpsError('invalid-argument', 'UID and OTP are required.');
    }

    const otpRef = db.collection('otpVerifications').doc(uid);
    const otpSnap = await otpRef.get();

    if (!otpSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'No OTP found. Please request a new one.');
    }

    const data = otpSnap.data()!;

    // Check expiry
    const expiresAt: admin.firestore.Timestamp = data.expiresAt;
    if (Date.now() > expiresAt.toMillis()) {
        await otpRef.delete();
        throw new functions.https.HttpsError('deadline-exceeded', 'OTP has expired. Please request a new one.');
    }

    // Check attempt limit
    const attempts: number = data.attempts ?? 0;
    if (attempts >= 3) {
        await otpRef.delete();
        throw new functions.https.HttpsError('resource-exhausted', 'Too many incorrect attempts. Please request a new OTP.');
    }

    // Validate
    const enteredHash = hashOtp(enteredOtp.trim());
    if (enteredHash !== data.otpHash) {
        await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
        const remaining = 2 - attempts;
        throw new functions.https.HttpsError('invalid-argument', `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }

    // ✅ OTP correct — clean up and mark verified
    await otpRef.delete();
    await db.collection('users').doc(uid).update({ emailVerified: true });

    return { success: true };
});
