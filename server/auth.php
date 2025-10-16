<?php
// auth.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/csrf.php';

// Route by action
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'csrf') {
    json_response(['csrfToken' => csrf_token()], 200);
}

// Registration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
    $token = $_POST['_csrf'] ?? '';
    if (!csrf_check($token)) {
        json_response(['ok' => false, 'error' => 'invalid_csrf_token'], 403);
    }

    $firstName = trim($_POST['firstName'] ?? '');
    $lastName  = trim($_POST['lastName'] ?? '');
    $email     = trim($_POST['email'] ?? '');
    $phone     = trim($_POST['phone'] ?? '');
    $country   = trim($_POST['country'] ?? '');
    $username  = trim($_POST['username'] ?? '');
    $password  = $_POST['password'] ?? '';

    if (!$firstName || !$lastName || !$email || !$username || !$password) {
        json_response(['ok' => false, 'error' => 'invalid_input'], 422);
    }

    // Hash password
    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        // Example table: users(id, first_name, last_name, email UNIQUE, phone, country, username UNIQUE, password_hash, created_at)
        $stmt = $pdo->prepare("
            INSERT INTO users (first_name, last_name, email, phone, country, username, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([$firstName, $lastName, $email, $phone, $country, $username, $hash]);
        json_response(['ok' => true], 201);
    } catch (PDOException $e) {
        // Duplicate email/username handling (SQLSTATE 23000 is common for unique violation)
        if ($e->getCode() === '23000') {
            json_response(['ok' => false, 'error' => 'conflict'], 409);
        }
        json_response(['ok' => false, 'error' => 'server_error'], 500);
    }
}

// Fallback
json_response(['ok' => false, 'error' => 'not_found'], 404);
