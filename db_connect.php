<?php
declare(strict_types=1);

require_once __DIR__ . '/server/config.php';

if (!function_exists('get_db_connection')) {
    /**
     * Returns a shared PDO instance configured via server/config.php.
     */
    function get_db_connection(): PDO
    {
        return db();
    }
}
