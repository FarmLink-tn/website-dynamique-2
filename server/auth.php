<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/csrf.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Credentials: true');
    exit;
}

if ($method === 'GET' && $action === 'check') {
    $loggedIn = !empty($_SESSION['user_id']);

    json_response([
        'status' => 'success',
        'success' => true,
        'csrfToken' => csrf_token(),
        'loggedIn' => $loggedIn,
    ]);
}

if ($method === 'POST' && $action === 'register') {
    $payload = request_body();
    $token = $_SERVER['HTTP_X_CSRF_TOKEN']
        ?? $payload['csrf_token']
        ?? $payload['_csrf']
        ?? '';

    if (!csrf_check($token)) {
        json_response([
            'status' => 'error',
            'success' => false,
            'message' => 'Jeton CSRF invalide.',
        ], 403);
    }

    $rawPhone = (string)($payload['phone'] ?? '');
    $normalizedPhone = preg_replace('/\D+/', '', $rawPhone);

    $data = [
        'last_name' => trim((string)($payload['last_name'] ?? '')),
        'first_name' => trim((string)($payload['first_name'] ?? '')),
        'email' => strtolower(trim((string)($payload['email'] ?? ''))),
        'phone' => $normalizedPhone,
        'region' => trim((string)($payload['region'] ?? '')),
        'password' => (string)($payload['password'] ?? ''),
    ];

    $errors = [];

    foreach (['last_name', 'first_name', 'email', 'phone', 'region', 'password'] as $field) {
        if ($data[$field] === '') {
            $errors[] = 'Le champ ' . str_replace('_', ' ', $field) . ' est requis.';
        }
    }

    if ($data['email'] && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Adresse e-mail invalide.';
    }

    if ($normalizedPhone !== '' && strlen($normalizedPhone) < 8) {
        $errors[] = 'Le numéro de téléphone doit contenir au moins 8 chiffres.';
    }

    if ($data['password'] !== '' && strlen($data['password']) < 8) {
        $errors[] = 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if ($errors) {
        json_response([
            'status' => 'error',
            'success' => false,
            'message' => implode(' ', $errors),
        ], 422);
    }

    try {
        $pdo = db();
    } catch (PDOException $exception) {
        error_log('Database connection error: ' . $exception->getMessage());
        $message = 'Connexion à la base de données impossible.';

        if (filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN)) {
            $message .= ' ' . $exception->getMessage();
        }

        json_response([
            'status' => 'error',
            'success' => false,
            'message' => $message,
        ], 500);
    }

    try {
        $check = $pdo->prepare('SELECT 1 FROM users WHERE email = :email LIMIT 1');
        $check->execute([':email' => $data['email']]);

        if ($check->fetchColumn()) {
            json_response([
                'status' => 'error',
                'success' => false,
                'message' => 'Un compte existe déjà avec cette adresse e-mail.',
            ], 409);
        }

        $statement = $pdo->prepare(
            'INSERT INTO users (email, first_name, last_name, phone, region, password, created_at)
             VALUES (:email, :first_name, :last_name, :phone, :region, :password, NOW())'
        );

        $statement->execute([
            ':email' => $data['email'],
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':phone' => $data['phone'],
            ':region' => $data['region'],
            ':password' => password_hash($data['password'], PASSWORD_DEFAULT),
        ]);

        json_response([
            'status' => 'success',
            'success' => true,
            'message' => 'Utilisateur créé avec succès.',
        ], 201);
    } catch (PDOException $exception) {
        error_log('Registration failed: ' . $exception->getMessage());

        json_response([
            'status' => 'error',
            'success' => false,
            'message' => "Une erreur inattendue est survenue.",
        ], 500);
    }
}

json_response([
    'status' => 'error',
    'success' => false,
    'message' => 'Route introuvable.',
], 404);
