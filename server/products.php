<?php
session_start();
header('Content-Type: application/json');

// Ensure CSRF token exists
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Validate CSRF token on non-GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!$token || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
        exit;
    }
}

$config = require __DIR__ . '/config.php';
try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4",
        $config['user'],
        $config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Optional SMS integration placeholder
function send_sms($phone, $message) {
    $url = getenv('SMS_API_URL');
    if (!$url) return false;
    $query = http_build_query(['to' => $phone, 'message' => $message]);
    $ch = curl_init("$url?$query");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);
    $response = curl_exec($ch);
    if ($response === false) {
        error_log('SMS API request error: ' . curl_error($ch));
        curl_close($ch);
        return false;
    }
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status >= 400) {
        error_log("SMS API responded with HTTP $status: $response");
        return false;
    }
    return true;
}

function validate_product(array $data): array {
    $errors = [];

    if (array_key_exists('quantity', $data)) {
        if (filter_var($data['quantity'], FILTER_VALIDATE_INT) === false || $data['quantity'] < 0 || $data['quantity'] > 1000) {
            $errors[] = 'Quantity must be an integer between 0 and 1000';
        }
    }

    if (array_key_exists('valve_angle', $data)) {
        if (filter_var($data['valve_angle'], FILTER_VALIDATE_INT) === false || $data['valve_angle'] < 0 || $data['valve_angle'] > 180) {
            $errors[] = 'Valve angle must be an integer between 0 and 180';
        }
    }

    $numericFields = [
        'ph' => [0, 14],
        'rain' => [0, 100],
        'humidity' => [0, 100],
        'soil_humidity' => [0, 100],
        'light' => [0, 100],
    ];

    foreach ($numericFields as $field => [$min, $max]) {
        if (array_key_exists($field, $data)) {
            if (!is_numeric($data[$field])) {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' must be numeric';
            } elseif ($data[$field] < $min || $data[$field] > $max) {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . " must be between $min and $max";
            }
        }
    }

    return $errors;
}

switch ($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM products WHERE user_id = ? AND id = ?');
            $stmt->execute([$userId, $id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($product ?: []);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM products WHERE user_id = ?');
            $stmt->execute([$userId]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $data = array_merge(['quantity' => 0, 'valve_angle' => 0], $input);
        $errors = validate_product($data);
        if ($errors) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => implode('; ', $errors)]);
            break;
        }
        $stmt = $pdo->prepare('INSERT INTO products (user_id, name, quantity, phone, ph, rain, humidity, soil_humidity, light, valve_open, valve_angle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $userId,
            $data['name'] ?? '',
            $data['quantity'],
            $data['phone'] ?? '',
            $data['ph'] ?? null,
            $data['rain'] ?? null,
            $data['humidity'] ?? null,
            $data['soil_humidity'] ?? null,
            $data['light'] ?? null,
            $data['valve_open'] ?? 0,
            $data['valve_angle']
        ]);
        if (!empty($input['send_sms'])) {
            if (!send_sms($input['phone'], 'New order for ' . ($input['name'] ?? 'product'))) {
                error_log('Failed to send SMS for product creation');
            }
        }
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
        $id = $query['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing id']);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $errors = validate_product($input);
        if ($errors) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => implode('; ', $errors)]);
            break;
        }
        $fields = [];
        $params = [];
        foreach (['name','quantity','phone','ph','rain','humidity','soil_humidity','light','valve_open','valve_angle'] as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        if (!$fields) {
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            break;
        }
        $params[] = $userId;
        $params[] = $id;
        $stmt = $pdo->prepare('UPDATE products SET ' . implode(',', $fields) . ' WHERE user_id = ? AND id = ?');
        $stmt->execute($params);
        if (!empty($input['send_sms'])) {
            $stmt = $pdo->prepare('SELECT phone, name FROM products WHERE user_id = ? AND id = ?');
            $stmt->execute([$userId, $id]);
            $prod = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($prod) {
                if (!send_sms($prod['phone'], 'Order update for ' . $prod['name'])) {
                    error_log('Failed to send SMS for product update');
                }
            }
        }
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
        $id = $query['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing id']);
            break;
        }
        $stmt = $pdo->prepare('DELETE FROM products WHERE user_id = ? AND id = ?');
        $stmt->execute([$userId, $id]);
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
