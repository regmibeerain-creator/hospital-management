<!DOCTYPE html>
<html>
<head><title>OTP Code</title></head>
<body style="font-family: Arial, sans-serif; padding: 40px;">
    <h2>Hello, {{ $user->name }}!</h2>
    <p>Your verification code is:</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0;">{{ $otp }}</div>
    <p>This code will expire in 5 minutes.</p>
    <p>If you did not request this code, please ignore this email.</p>
</body>
</html>
