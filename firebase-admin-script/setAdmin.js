// setAdmin.js
const admin = require('firebase-admin');

// تأكد أن هذا المسار صحيح لملف serviceAccountKey.json الخاص بك
// يجب أن يكون في نفس المجلد الذي يوجد به هذا السكريبت
const serviceAccount = require('./serviceAccountKey.json');

// تهيئة Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// البريد الإلكتروني للمستخدم الذي تريد منحه صلاحيات المدير
const adminEmail = 'moaz@gmail.com';

async function setAdminClaim() {
  try {
    // 1. الحصول على المستخدم بواسطة البريد الإلكتروني
    const user = await admin.auth().getUserByEmail(adminEmail);
    const uid = user.uid; // هذا هو الـ UID الخاص بالمستخدم في Firebase Authentication

    // 2. تعيين الـ Custom Claim 'admin: true' لهذا المستخدم
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // 3. التحقق من الـ Custom Claims (اختياري، ولكن جيد للتصحيح)
    const updatedUser = await admin.auth().getUser(uid);
    console.log(`Custom claims for ${adminEmail}:`, updatedUser.customClaims);

    console.log(`Successfully set admin role for ${adminEmail}.`);
    console.log('The user needs to log out and log back in for the changes to take effect.');

  } catch (error) {
    console.error('Error setting admin role:', error);
    if (error.code === 'auth/user-not-found') {
      console.error('Please ensure the user moaz@gmail.com exists in Firebase Authentication.');
    }
  }
}

// تشغيل الدالة
setAdminClaim();