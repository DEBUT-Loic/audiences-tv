<?php
error_reporting(E_ALL); ini_set("display_errors", 1);
$moisTab = array("janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre");

include "analyse_liens.php";

setlocale(LC_TIME, 'french');

$dateFormStr = "";
if(!empty($_GET["dateForm"])) {
    $dateForm = $_GET["dateForm"];
    [$anneeForm,$moisForm,$jourForm] = explode("-",$dateForm);

    // Traitement d'un formulaire : jourForm, moisForm, anneeForm (en entiers)
    $timestamp = mktime(0, 0, 0, intval($moisForm), intval($jourForm), intval($anneeForm));
    $dateForm = (new DateTime())->setTimestamp($timestamp);

    // Jour du mois sans 0 devant
    $jourSansZero = intval($jourForm);

    // Construction manuelle du format : jour-seul - nom-mois - année
    $dateFormStr = $dateForm->format('l') . '-' . $jourSansZero . '-' . $moisTab[intval($moisForm) - 1] . '-' . $dateForm->format('Y');

    // Pour avoir les noms en français (au lieu de Monday → Lundi), utilise IntlDateFormatter
    $formatter2 = new IntlDateFormatter('fr_FR', IntlDateFormatter::FULL, IntlDateFormatter::NONE, null, null, 'EEEE');
    $jourSemaine = $formatter2->format($dateForm);

    $dateFormStr = $jourSemaine . '-' . $jourSansZero . '-' . $moisTab[intval($moisForm) - 1] . '-' . $dateForm->format('Y');

}
// URL cible
$url = lien_audiences($dateFormStr);

// echo $url;

$dateURL = "";
// Récupérer la date
// Expression régulière pour capturer le jour, le mois en lettres, et l'année
if (preg_match('/(\d{1,2})-([a-zéû]+)-(\d{4})/', $url, $matches)) {
    $jour = $matches[1];
    $moisTexte = strtolower($matches[2]);
    $annee = $matches[3];

    // Tableau de correspondance mois français => numéro
    $mois = [
        'janvier' => '01',
        'fevrier' => '02',
        'mars' => '03',
        'avril' => '04',
        'mai' => '05',
        'juin' => '06',
        'juillet' => '07',
        'aout' => '08',
        'septembre' => '09',
        'octobre' => '10',
        'novembre' => '11',
        'decembre' => '12'
    ];

    // Création d'une date à partir de $moisTexte, $jour, $annee
    $moisIndex = $mois[$moisTexte]; // ex: "janvier" => 1
    $timestamp = mktime(0, 0, 0, $moisIndex, $jour, $annee);
    $date = (new DateTime())->setTimestamp($timestamp);

    // Formatter en français (nom du jour, mois, année)
    $formatter = new IntlDateFormatter('fr_FR', IntlDateFormatter::FULL, IntlDateFormatter::NONE, null, null, 'EEEE d MMMM yyyy');
    $dateURL = ucfirst($formatter->format($date)); // Exemple : "Lundi 18 juillet 2025"
}

// Récupérer le contenu HTML de la page
$html = file_get_contents($url);

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

$data[] = ["date" => $dateURL];

// Retour JSON
$json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($json === false) {
    echo "Erreur json_encode : " . json_last_error_msg();
} else {
    echo $json;
}
?>