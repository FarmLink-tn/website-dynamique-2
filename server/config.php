<?php
declare(strict_types=1);

// -----------------------------------------------------------------------------
// Environment loading
// -----------------------------------------------------------------------------
if (!function_exists('load_env_file')) {
    function load_env_file(string $path): void
    {
        if (!is_file($path) || !is_readable($path)) {
            return;
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if ($line === '' || $line[0] === '#') {
                continue;
            }

            if (!str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? $default;
    }
}

// Load environment variables from /server/.env then project root .env
$envFiles = [
    __DIR__ . '/.env',
    dirname(__DIR__) . '/.env',
];

foreach ($envFiles as $envFile) {
    load_env_file($envFile);
}

// -----------------------------------------------------------------------------
// PHP runtime configuration
// -----------------------------------------------------------------------------
$debugMode = filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);

error_reporting(E_ALL);
ini_set('display_errors', $debugMode ? '1' : '0');

$sameSite = env('SESSION_SAMESITE', 'Lax');
$secure = filter_var(env('SESSION_SECURE', 'false'), FILTER_VALIDATE_BOOLEAN);

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => env('SESSION_DOMAIN', ''),
    'secure' => $secure,
    'httponly' => true,
    'samesite' => $sameSite,
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// -----------------------------------------------------------------------------
// Database configuration helper
// -----------------------------------------------------------------------------
$GLOBALS['__db_config'] = $GLOBALS['__db_config'] ?? [
    'host' => env('DB_HOST', '10.10.10.100'),
    'port' => (int) env('DB_PORT', '3306'),
    'dbname' => env('DB_NAME', 'brefzuoh_farmlink'),
    'user' => env('DB_USER', 'brefzuoh_farmlink'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
];

if (!function_exists('db')) {
    function db(): PDO
    {
        static $pdo = null;

        if ($pdo instanceof PDO) {
            return $pdo;
        }

        $config = $GLOBALS['__db_config'];

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $config['host'],
            $config['port'],
            $config['dbname'],
            $config['charset']
        );

        try {
            $pdo = new PDO($dsn, $config['user'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $exception) {
            error_log(sprintf('Database connection failed (%s): %s', $dsn, $exception->getMessage()));
            throw $exception;
        }

        return $pdo;
    }
}

// -----------------------------------------------------------------------------
// Response helpers
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

return $GLOBALS['__db_config'];
