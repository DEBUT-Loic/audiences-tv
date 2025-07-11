<?php
header('Content-Type: application/json; charset=utf-8');

function lien_audiences() {
    // 1. Récupérer le HTML
    $url = "https://www.toutelatele.com/top-audiences-tv-prime-time-1344";
    $html = file_get_contents($url);

    // 2. Extraire les liens <a> contenant 'audiences-tv-prime-' dans href
    $pattern = '/<a[^>]+href=["\']([^"\']*audiences-tv-prime-[^"\']*)["\']/i';
    preg_match_all($pattern, $html, $matches);

    // 3. Nettoyer et dédupliquer les liens
    $links = [];
    foreach ($matches[1] as $href) {
        // Compléter les URLs relatives
        if (strpos($href, 'http') !== 0) {
            $href = 'https://www.toutelatele.com/' . ltrim($href, '/');
        }
        $links[$href] = true; // déduplication
    }

    $urls = array_keys($links);

    // 4. Affichage ou traitement
    return $urls[1];
}

?>