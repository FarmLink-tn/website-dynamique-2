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

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (!str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }

        $_ENV['_loaded_env_files'][] = realpath($path) ?: $path;
    }
}

if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? $default;
    }
}

if (!function_exists('env_bool')) {
    function env_bool(string $key, bool $default = false): bool
    {
        return filter_var(env($key, $default ? 'true' : 'false'), FILTER_VALIDATE_BOOLEAN);
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

if (!isset($_ENV['_loaded_env_files'])) {
    $_ENV['_loaded_env_files'] = [];
}

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

$sameSite = env('SESSION_SAMESITE', 'Lax');
$secure = env_bool('SESSION_SECURE');

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
    'dbname' => env('DB_NAME'),
    'user' => env('DB_USER'),
    'password' => env('DB_PASSWORD'),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
];

if (!function_exists('db_config')) {
    function db_config(): array
    {
        return $GLOBALS['__db_config'];
    }
}

if (!function_exists('db')) {
    function db(): PDO
    {
        static $pdo = null;

        if ($pdo instanceof PDO) {
            return $pdo;
        }

        $config = db_config();

        foreach (['host', 'port', 'dbname', 'user', 'password', 'charset'] as $key) {
            if ($config[$key] === null || $config[$key] === '') {
                throw new RuntimeException(sprintf(
                    'Configuration manquante pour %s. Créez un fichier .env avec %s défini.',
                    $key,
                    strtoupper('DB_' . $key)
                ));
            }
        }

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
            throw new RuntimeException('Database connection failed: ' . $exception->getMessage(), 0, $exception);
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
