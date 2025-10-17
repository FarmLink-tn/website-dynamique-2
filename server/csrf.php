<?php
// csrf.php — génère/retourne un token par session
require_once __DIR__ . '/config.php';

if (!function_exists('csrf_token')) {
    function csrf_token(): string {
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf'];
    }
}

if (!function_exists('csrf_check')) {
    function csrf_check(?string $token): bool {
        if (!$token || empty($_SESSION['csrf'])) {
            return false;
        }

        return hash_equals($_SESSION['csrf'], $token);
    }
}

if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__ && $_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'success',
        'success' => true,
        'csrfToken' => csrf_token(),
    ]);
    exit;
}
