<?php
// contact_submit.php — reçoit le POST, vérifie CSRF, envoie l’email via PHPMailer SMTP
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_response(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

require_csrf($_POST);

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_response(['ok' => false, 'error' => 'invalid_input'], 422);
}

$mail = new PHPMailer(true);
try {
  $mail->isSMTP();                                   // SMTP pour fiabilité [web:135][web:134]
  $mail->Host     = env('SMTP_HOST', '');
  $mail->Port     = (int) env('SMTP_PORT', '587');
  $secure         = strtolower(env('SMTP_SECURE', 'tls'));
  $mail->SMTPSecure = $secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
  $mail->SMTPAuth = true;
  $mail->Username = env('SMTP_USER', '');
  $mail->Password = env('SMTP_PASS', '');

  $from = env('MAIL_FROM', 'no-reply@farmlink.tn');
  $to   = env('MAIL_TO', $from);

  $mail->setFrom($from, 'FarmLink');
  $mail->addAddress($to);
  $mail->addReplyTo($email, $name);
  $mail->Subject = "[FarmLink] Contact: {$name}";
  $mail->isHTML(false);
  $mail->Body = "De: {$name} <{$email}>\n\n{$message}";

  $mail->send();
  json_response(['ok' => true]);
} catch (Exception $e) {
  json_response(['ok' => false, 'error' => 'mail_failed'], 500);
}
