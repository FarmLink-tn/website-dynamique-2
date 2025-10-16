<?php
declare(strict_types=1);

require_once __DIR__ . '/server/config.php';

header('Content-Type: text/plain; charset=utf-8');

$debug = filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);

try {
    db();
    echo 'OK DB';
} catch (Throwable $exception) {
    http_response_code(500);
    error_log('Database connectivity check failed: ' . $exception->getMessage());

    if ($debug) {
        echo 'Database connection failed: ' . $exception->getMessage();
    } else {
        echo 'Database connection failed. Consultez les journaux du serveur pour plus de détails.';
    }
}
