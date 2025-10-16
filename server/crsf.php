<?php
// csrf.php
require_once __DIR__ . '/config.php';

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_check(?string $token): bool {
    if (!$token || empty($_SESSION['csrf'])) return false;
    return hash_equals($_SESSION['csrf'], $token);
}

// If called directly (GET), return a token as JSON
if (php_sapi_name() !== 'cli' && $_SERVER['REQUEST_METHOD'] === 'GET' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    json_response(['csrfToken' => csrf_token()], 200);
}
