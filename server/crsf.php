<?php
// Deprecated duplicate kept for legacy includes
require_once __DIR__ . '/bootstrap.php';

if (php_sapi_name() !== 'cli'
    && $_SERVER['REQUEST_METHOD'] === 'GET'
    && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')
) {
    json_response([
        'status' => 'success',
        'success' => true,
        'csrfToken' => csrf_token(),
    ]);
}
