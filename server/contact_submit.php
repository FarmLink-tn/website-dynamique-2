<?php
// contact_submit.php — reçoit le POST, vérifie CSRF, envoie l’email via PHPMailer SMTP
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>false,'error'=>'method_not_allowed']);
  exit;
}

$token = $_POST['_csrf'] ?? '';
if (!csrf_check($token)) {
  http_response_code(403);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>false,'error'=>'invalid_csrf_token']);
  exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>false,'error'=>'invalid_input']);
  exit;
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
  http_response_code(200);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>true]);
} catch (Exception $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>false,'error'=>'mail_failed']);
}
