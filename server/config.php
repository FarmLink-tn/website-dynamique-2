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

        if (!isset($_ENV['_loaded_env_files']) || !is_array($_ENV['_loaded_env_files'])) {
            $_ENV['_loaded_env_files'] = [];
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || $trimmed[0] === '#') {
                continue;
            }

            if (!preg_match('/^(?:export\s+)?([A-Z0-9_\.]+)\s*=\s*(.*)$/i', $trimmed, $matches)) {
                continue;
            }

            $key = $matches[1];
            $value = $matches[2];

            // Remove inline comments that appear outside of quoted values
            if ($value !== '' && $value[0] !== "'" && $value[0] !== '"') {
                $value = preg_split('/\s+#/', $value, 2)[0];
                $value = preg_split('/\s+;/', $value, 2)[0];
                $value = trim($value);
            }

            if ($value !== '' && ($value[0] === '"' || $value[0] === "'")) {
                $quote = $value[0];
                $value = substr($value, 1);
                if (str_ends_with($value, $quote)) {
                    $value = substr($value, 0, -1);
                }

                if ($quote === '"') {
                    $value = str_replace(['\\n', '\\r', '\\"', '\\\\'], ["\n", "\r", '"', '\\'], $value);
                }
            }

            $value = trim($value);

            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
            putenv($key . '=' . $value);
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

return $GLOBALS['__db_config'];
