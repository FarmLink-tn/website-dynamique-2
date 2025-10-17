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

    $data = [
        'last_name' => trim((string)($payload['last_name'] ?? '')),
        'first_name' => trim((string)($payload['first_name'] ?? '')),
        'email' => strtolower(trim((string)($payload['email'] ?? ''))),
        'phone' => preg_replace('/\D+/', '', (string)($payload['phone'] ?? '')),
        'region' => trim((string)($payload['region'] ?? '')),
        'username' => trim((string)($payload['username'] ?? '')),
        'password' => (string)($payload['password'] ?? ''),
    ];

    $errors = [];

    foreach (['last_name', 'first_name', 'email', 'phone', 'region', 'username', 'password'] as $field) {
        if ($data[$field] === '') {
            $errors[] = 'Le champ ' . str_replace('_', ' ', $field) . ' est requis.';
        }
    }

    if ($data['email'] && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Adresse e-mail invalide.";
    }

    if ($data['phone'] && strlen($data['phone']) < 8) {
        $errors[] = "Le numéro de téléphone doit contenir au moins 8 chiffres.";
    }

    if ($data['username'] && strlen($data['username']) < 3) {
        $errors[] = "Le nom d'utilisateur doit contenir au moins 3 caractères.";
    }

    if ($data['password'] && strlen($data['password']) < 8) {
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
        json_response([
            'status' => 'error',
            'success' => false,
            'message' => 'Connexion à la base de données impossible.',
        ], 500);
    }

    try {
        $statement = $pdo->prepare(
            'INSERT INTO users (last_name, first_name, email, phone, region, username, password_hash, created_at)
             VALUES (:last_name, :first_name, :email, :phone, :region, :username, :password_hash, NOW())'
        );

        $statement->execute([
            ':last_name' => $data['last_name'],
            ':first_name' => $data['first_name'],
            ':email' => $data['email'],
            ':phone' => $data['phone'],
            ':region' => $data['region'],
            ':username' => $data['username'],
            ':password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
        ]);

        json_response([
            'status' => 'success',
            'success' => true,
            'message' => 'Utilisateur créé avec succès.',
        ], 201);
    } catch (PDOException $exception) {
        error_log('Registration failed: ' . $exception->getMessage());

        if ((int)$exception->getCode() === 23000) {
            json_response([
                'status' => 'error',
                'success' => false,
                'message' => "Cet email ou nom d'utilisateur est déjà utilisé.",
            ], 409);
        }

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
