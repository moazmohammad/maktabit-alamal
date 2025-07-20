import { NextResponse } from "next/server"
import nodemailer from "nodemailer" // استيراد nodemailer

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const { name, email, subject, message } = formData

    // Logging for debugging (يمكنك إزالتها لاحقاً)
    console.log("Received contact form submission:")
    console.log("Name:", name)
    console.log("Email:", email)
    console.log("Subject:", subject)
    console.log("Message:", message)

    // إعداد الناقل (Transporter) لـ Nodemailer
    // استخدم بيانات اعتماد بريدك الإلكتروني ومتغيرات البيئة
    const transporter = nodemailer.createTransport({
      service: "gmail", // يمكنك تغيير هذا إلى خدمة البريد الإلكتروني الخاصة بك (مثل "Outlook", "SendGrid", إلخ)
      auth: {
        user: process.env.EMAIL_USER, // بريد إلكتروني المرسل من .env.local
        pass: process.env.EMAIL_PASS, // كلمة مرور البريد الإلكتروني من .env.local
      },
    })

    // إعداد خيارات البريد الإلكتروني
    const mailOptions = {
      from: process.env.EMAIL_USER, // من بريدك الإلكتروني
      to: process.env.TO_EMAIL, // إلى بريد مسؤول المتجر
      subject: `رسالة جديدة من نموذج الاتصال: ${subject || "لا يوجد موضوع"}`,
      html: `
        <p>لديك رسالة جديدة من نموذج الاتصال في موقع مكتبة الأمل:</p>
        <ul>
          <li><strong>الاسم:</strong> ${name}</li>
          <li><strong>البريد الإلكتروني:</strong> ${email}</li>
          <li><strong>الموضوع:</strong> ${subject || "لا يوجد موضوع"}</li>
          <li><strong>الرسالة:</strong><br>${message}</li>
        </ul>
      `,
    }

    // إرسال البريد الإلكتروني
    await transporter.sendMail(mailOptions)

    console.log("Email sent successfully!")

    return NextResponse.json({ message: "تم استلام رسالتك بنجاح وإرسالها!" }, { status: 200 })
  } catch (error: any) {
    console.error("Error processing contact form submission or sending email:", error)
    return NextResponse.json({ message: `فشل إرسال الرسالة: ${error.message}` }, { status: 500 })
  }
}
