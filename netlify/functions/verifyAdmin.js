const admin = require("firebase-admin");

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;
const AUTHORIZED_ADMIN_EMAILS = process.env.AUTHORIZED_ADMIN_EMAILS || "";

function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  let credential;

  if (FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
      throw new Error("Invalid Firebase service account configuration");
    }
  } else if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  } else {
    throw new Error("Firebase admin credentials are not configured");
  }

  return admin.initializeApp({
    credential,
    projectId: FIREBASE_PROJECT_ID,
  });
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return buildResponse(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return buildResponse(405, { error: "Method Not Allowed" });
  }

  const authorization = event.headers?.authorization || event.headers?.Authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return buildResponse(401, { error: "Missing or invalid Authorization header" });
  }

  const idToken = authorization.replace("Bearer ", "").trim();

  try {
    const firebaseApp = initFirebaseAdmin();
    const decodedToken = await firebaseApp.auth().verifyIdToken(idToken);
    const email = decodedToken.email || decodedToken.user_email;

    if (!email) {
      return buildResponse(403, { error: "Unable to determine user email" });
    }

    // Allow explicit admin claim from Firebase custom claims.
    if (decodedToken.admin === true || decodedToken.role === "admin") {
      return buildResponse(200, { authorized: true, email });
    }

    const allowedEmails = AUTHORIZED_ADMIN_EMAILS
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    if (allowedEmails.includes(email.toLowerCase())) {
      return buildResponse(200, { authorized: true, email });
    }

    // Fallback: read an allowlist from Firestore
    const db = firebaseApp.firestore();
    const allowlistDoc = await db.doc("adminConfig/authorized").get();
    if (allowlistDoc.exists) {
      const emails = allowlistDoc.data()?.emails;
      if (Array.isArray(emails) && emails.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
        return buildResponse(200, { authorized: true, email });
      }
    }

    return buildResponse(403, { error: "User is not authorized", email });
  } catch (error) {
    console.error("verifyAdmin error:", error);
    return buildResponse(500, { error: "Admin verification failed" });
  }
};
