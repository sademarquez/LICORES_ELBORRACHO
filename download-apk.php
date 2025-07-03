<?php
// Archivo para forzar descarga correcta del APK en Android
header('Content-Type: application/vnd.android.package-archive');
header('Content-Disposition: attachment; filename="el-borracho.apk"');
header('Content-Length: ' . filesize('el-borracho.apk'));
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');

// Detectar Android y ajustar headers
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
if (strpos($userAgent, 'Android') !== false) {
    header('Content-Type: application/vnd.android.package-archive');
    header('X-Android-Install: true');
}

readfile('el-borracho.apk');
exit;
?>