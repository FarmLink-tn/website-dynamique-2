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
