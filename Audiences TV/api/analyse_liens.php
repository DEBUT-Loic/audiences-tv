<?php
header('Content-Type: application/json; charset=utf-8');

function lien_audiences($dateForm) {
    // 1. Récupérer le HTML
    $url = "https://www.toutelatele.com/top-audiences-tv-prime-time-1344";
    // 2. Extraire les liens <a> contenant 'audiences-tv-prime-' dans href
    $pattern = '/<a[^>]+href=["\']([^"\']*audiences-tv-prime-[^"\']*)["\']/i';

    $links = [];

    if(empty($dateForm)) {
        $html = file_get_contents($url);

        
        preg_match_all($pattern, $html, $matches);

        // 3. Nettoyer et dédupliquer les liens
    
        foreach ($matches[1] as $href) {
            // Compléter les URLs relatives
            if (strpos($href, 'http') !== 0) {
                $href = 'https://www.toutelatele.com/' . ltrim($href, '/');
            }
            $links[$href] = true; // déduplication
        }
    }
    else {
        $iPage = 0;

        do {
            $trouve = false;
            $urlPage = $url."?debut_page=".$iPage;
            $htmlPage = file_get_contents($urlPage);

            preg_match_all($pattern, $htmlPage, $matches);

            foreach ($matches[1] as $href) {
                // Compléter les URLs relatives
                if (strpos($href, 'http') !== 0) {
                    $href = 'https://www.toutelatele.com/' . ltrim($href, '/');

                    if(strpos($href, $dateForm) !== false) {
                        $links[0] = true;
                        $links[$href] = true; // déduplication
                        $trouve = true;
                    }
                }
                
            }
            $iPage += 40;

        } while ($trouve !== true);
    }
    

    $urls = array_keys($links);

    return $urls[1];
}
?>