<?php
// csrf.php — conserve la compatibilité avec les inclusions existantes
require_once __DIR__ . '/bootstrap.php';

if (php_sapi_name() !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__ && $_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response([
        'status' => 'success',
        'success' => true,
        'csrfToken' => csrf_token(),
    ]);
}
