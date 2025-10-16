<?php
// config.php — session sécurisée + env
$env = __DIR__.'/.env';
if (is_file($env)) {
  foreach (file($env, FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES) as $line) {
    if ($line[0]==='#' || !str_contains($line,'=')) continue;
    [$k,$v] = explode('=', $line, 2); $_ENV[trim($k)] = trim($v);
  }
}
function env($k,$d=null){ return $_ENV[$k] ?? $d; }

$sameSite = env('SESSION_SAMESITE','Lax');         // 'Lax' par défaut
$secure   = filter_var(env('SESSION_SECURE','false'), FILTER_VALIDATE_BOOLEAN);
session_set_cookie_params(['lifetime'=>0,'path'=>'/','domain'=> env('SESSION_DOMAIN',''),'secure'=>$secure,'httponly'=>true,'samesite'=>$sameSite]);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();

$GLOBALS['__db_config'] = $GLOBALS['__db_config'] ?? [
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'dbname' => env('DB_NAME', 'farmlink'),
    'user' => env('DB_USER', 'root'),
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

        $pdo = new PDO($dsn, $config['user'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return $pdo;
    }
}

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
