import { prisma } from "./prismaDB";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "./email";

type CreateAccountResult = {
  created: boolean;
  email: string;
  password?: string;
};

/**
 * Ensure a user account exists for the given email. If no user exists,
 * creates one with a generated password and emails the credentials.
 * If user exists but has no password, sets a generated password and emails it.
 * If user exists and has a password, sends an informational access email.
 */
export const ensureAccountAndNotify = async (email: string, name?: string): Promise<CreateAccountResult> => {
  if (!email) throw new Error("Email required");

  const normalizedEmail = email.toLowerCase();

  // Find existing user
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Helper to generate a safe random password
  const generatePassword = (len = 12) => crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);

  // If user does not exist, create one with password
  if (!user) {
    const plainPassword = generatePassword(12);
    const hashed = await bcrypt.hash(plainPassword, 10);
    user = await prisma.user.create({ data: { email: normalizedEmail, name: name ?? null, password: hashed } });

    // Send credentials email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Hozzáférés a rendszer.szenzor24.hu-hoz",
        html: `
          <p>Kedves ${name ?? "Felhasználó"},</p>
          <p>Köszönjük a rendelésed! Létrehoztunk egy fiókot a <strong>rendszer.szenzor24.hu</strong> oldalon a rendeléshez használt email címmel.</p>
          <p><strong>Bejelentkezési adatok</strong></p>
          <ul>
            <li>Email: ${normalizedEmail}</li>
            <li>Jelszó: <code>${plainPassword}</code></li>
          </ul>
          <p>Kérjük, jelentkezz be és változtasd meg a jelszavad mielőbb. Erősen javasoljuk a jelszó megváltoztatását a fiók biztonsága érdekében.</p>
          <p><a href="https://rendszer.szenzor24.hu/login">Bejelentkezés</a> • <a href="https://rendszer.szenzor24.hu/forgot-password">Jelszó visszaállítása</a></p>
          <p>Üdvözlettel,<br/>Szenzor24 csapata</p>
        `,
      });
    } catch (err) {
      console.error("Failed to send account email:", err);
    }

    return { created: true, email: normalizedEmail, password: plainPassword };
  }

  // User exists
  // If user has no password (e.g., OAuth-only), set one and send it
  if (!user.password) {
    const plainPassword = generatePassword(12);
    const hashed = await bcrypt.hash(plainPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, name: name ?? user.name } });

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Hozzáférés a rendszer.szenzor24.hu-hoz",
        html: `
          <p>Kedves ${name ?? user.name ?? "Felhasználó"},</p>
          <p>Az Ön fiókjához most jelszót állítottunk be a rendelés miatt.</p>
          <p><strong>Bejelentkezési adatok</strong></p>
          <ul>
            <li>Email: ${normalizedEmail}</li>
            <li>Jelszó: <code>${plainPassword}</code></li>
          </ul>
          <p>Kérjük, jelentkezz be és változtasd meg a jelszavad mielőbb.</p>
          <p><a href="https://rendszer.szenzor24.hu/login">Bejelentkezés</a> • <a href="https://rendszer.szenzor24.hu/forgot-password">Jelszó visszaállítása</a></p>
          <p>Üdvözlettel,<br/>Szenzor24 csapata</p>
        `,
      });
    } catch (err) {
      console.error("Failed to send account email:", err);
    }

    return { created: true, email: normalizedEmail, password: plainPassword };
  }

  // User exists and already has a password: send informational email (no password in plain text)
  try {
    await sendEmail({
      to: normalizedEmail,
      subject: "Hozzáférés a rendszer.szenzor24.hu-hoz",
      html: `
        <p>Kedves ${name ?? user.name ?? "Felhasználó"},</p>
        <p>Köszönjük a rendelésed! Az Ön email címe már regisztrálva van a <strong>rendszer.szenzor24.hu</strong> rendszeren.</p>
        <p>Jelentkezz be az alábbi linken. Ha nem emlékszik a jelszavára, használja a jelszó-visszaállítás funkciót.</p>
        <p><a href="https://rendszer.szenzor24.hu/login">Bejelentkezés</a> • <a href="https://rendszer.szenzor24.hu/forgot-password">Jelszó visszaállítása</a></p>
        <p>Üdvözlettel,<br/>Szenzor24 csapata</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send account info email:", err);
  }

  return { created: false, email: normalizedEmail };
};

export default ensureAccountAndNotify;
