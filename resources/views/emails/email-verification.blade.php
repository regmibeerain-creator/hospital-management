<!DOCTYPE html>
<html>
<head><title>Verify Email</title></head>
<body style="font-family: Arial, sans-serif; padding: 40px;">
    <h2>Welcome, {{ $user->name }}!</h2>
    <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
    <p><a href="{{ $signedUrl }}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
    <p>If you did not create an account, no further action is required.</p>
    <p>This link will expire in 60 minutes.</p>
</body>
</html>
