/**
 * Email templates in Russian
 */

export function getVerificationEmailTemplate(
  verificationUrl: string
): { subject: string; html: string } {
  const subject = 'Подтвердите вашу почту'

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
    <h1 style="color: #111827; margin-top: 0;">Здравствуйте!</h1>
    
    <p style="color: #374151; font-size: 16px;">
      Для завершения регистрации на платформе Трансформер, пожалуйста, подтвердите вашу почту:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" 
         style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Подтвердить почту
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Или скопируйте ссылку: <br>
      <a href="${verificationUrl}" style="color: #0d9488; word-break: break-all;">${verificationUrl}</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      Ссылка действительна 24 часа.
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      Если вы не регистрировались на Трансформере, просто проигнорируйте это письмо.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      <br>
      Команда Трансформерa
    </p>
  </div>
</body>
</html>
  `.trim()

  return { subject, html }
}

export function getPasswordResetEmailTemplate(
  resetUrl: string
): { subject: string; html: string } {
  const subject = 'Сброс пароля'

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
    <h1 style="color: #111827; margin-top: 0;">Здравствуйте!</h1>
    
    <p style="color: #374151; font-size: 16px;">
      Вы запросили сброс пароля для вашего аккаунта на Трансформере.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Сбросить пароль
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Или скопируйте ссылку: <br>
      <a href="${resetUrl}" style="color: #0d9488; word-break: break-all;">${resetUrl}</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      Ссылка действительна 1 час.
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      Если вы не запрашивали сброс пароля, проигнорируйте это письмо. Ваш пароль останется прежним.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      <br>
      Команда Трансформера
    </p>
  </div>
</body>
</html>
  `.trim()

  return { subject, html }
}
