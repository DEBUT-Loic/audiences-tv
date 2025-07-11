<?php
include "liste_liens.php";


// URL cible
$url = lien_audiences();

// Récupérer le contenu HTML de la page
$html = file_get_contents($url);

// // Extraire le tableau <table class="table spip">...</table> avec une regex
// if (preg_match("/<table[^>]*class="[^"]*table[^"]*"[^>]*>(.*?)<\/table>/is", $html, $matches)) {
//     $table = "<table class="table spip">" . $matches[1] . "</table>";
//     echo json_encode($table, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
// } else {
//     echo "Tableau non trouvé.";
// }

// Extraire le tableau HTML complet
if (!preg_match('/<table[^>]*class="[^"]*table[^"]*"[^>]*>(.*?)<\/table>/is', $html, $matches)) {
    echo json_encode(["error" => "Tableau non trouvé."]);
    exit;
}

$tableHtml = $matches[1];

// Extraire les lignes du tableau
preg_match_all('/<tr[^>]*>(.*?)<\/tr>/is', $tableHtml, $rows);

$data = [];
foreach ($rows[1] as $rowHtml) {
    // Extraire les colonnes <td>
    preg_match_all('/<td[^>]*>(.*?)<\/td>/is', $rowHtml, $cols);
    if (count($cols[1]) >= 4) {
        // 1ère colonne : extraire le alt de l’image <img alt="chaine" ...>
        if (preg_match('/<img[^>]+alt=["\']([^"\']+)["\']/i', $cols[1][0], $altMatch)) {
            $chaine = trim($altMatch[1]);
        } else {
            // fallback si pas d’image
            $chaine = trim(strip_tags($cols[1][0]));
        }

        // Les autres colonnes en texte nettoyé
        $programme = trim(strip_tags($cols[1][1]));
        $audience  = str_replace(" ","",trim(strip_tags($cols[1][2])));
        $pda       = trim(strip_tags($cols[1][3]));

        $data[] = [
            "chaine"    => $chaine,
            "programme" => $programme,
            "audience"  => $audience,
            "pda"       => $pda
        ];
    }
}

// Fonction de tri
usort($data, function($a, $b) {
    // Comparer audience (décroissant)
    if ($a["audience"] !== $b["audience"]) {
        return $b["audience"] <=> $a["audience"];
    }

    // Convertir pda "18.2%" en float 18.2
    $pdaA = floatval(str_replace("%", "", $a["pda"]));
    $pdaB = floatval(str_replace("%", "", $b["pda"]));

    // Comparer pda (décroissant)
    return $pdaB <=> $pdaA;
});

// Retour JSON
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>