<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

// -----------------------------------------------------------------------------
// PHP runtime configuration
// -----------------------------------------------------------------------------
$debugMode = env_bool('APP_DEBUG');

error_reporting(E_ALL);
ini_set('display_errors', $debugMode ? '1' : '0');

$timezone = env('APP_TIMEZONE', 'UTC');
if (is_string($timezone) && $timezone !== '') {
    date_default_timezone_set($timezone);
}

$cookieParams = [
    'lifetime' => 0,
    'path' => '/',
    'domain' => env('SESSION_DOMAIN', ''),
    'secure' => env_bool('SESSION_SECURE'),
    'httponly' => true,
    'samesite' => env('SESSION_SAMESITE', 'Lax'),
];

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params($cookieParams);
    session_start();
}

// -----------------------------------------------------------------------------
// Utility helpers
// -----------------------------------------------------------------------------
if (!function_exists('json_response')) {
    function json_response(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (!function_exists('request_body')) {
    function request_body(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (stripos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            if ($raw === '' || $raw === false) {
                return [];
            }

            $decoded = json_decode($raw, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                json_response([
                    'status' => 'error',
                    'success' => false,
                    'message' => 'JSON invalide dans la requête.',
                ], 400);
            }

            return is_array($decoded) ? $decoded : [];
        }

        return $_POST;
    }
}

if (!function_exists('csrf_token')) {
    function csrf_token(): string
    {
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }

        return (string) $_SESSION['csrf'];
    }
}

if (!function_exists('require_csrf')) {
    function require_csrf(?array $payload = null): void
    {
        $payload = $payload ?? [];
        $provided = $_SERVER['HTTP_X_CSRF_TOKEN']
            ?? $payload['csrf']
            ?? $payload['csrf_token']
            ?? $payload['_csrf']
            ?? null;

        $expected = $_SESSION['csrf'] ?? null;

        if (!$provided || !$expected || !hash_equals($expected, (string) $provided)) {
            json_response([
                'status' => 'error',
                'success' => false,
                'message' => 'Jeton CSRF invalide.',
            ], 403);
        }
    }
}

return true;
