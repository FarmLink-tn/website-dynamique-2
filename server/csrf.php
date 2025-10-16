<?php
// csrf.php — génère/retourne un token par session
require_once __DIR__ . '/config.php';

function csrf_token(): string {
  if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(32)); }
  return $_SESSION['csrf'];
}

function csrf_check(?string $token): bool {
  if (!$token || empty($_SESSION['csrf'])) return false;
  return hash_equals($_SESSION['csrf'], $token);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  http_response_code(200);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['csrfToken' => csrf_token()]);
  exit;
}
