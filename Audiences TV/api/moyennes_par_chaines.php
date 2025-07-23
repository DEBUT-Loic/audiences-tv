<?php
header('Content-Type: application/json; charset=utf-8');

$dates = [
    "2025-07-14", "2025-07-15", "2025-07-16", "2025-07-17",
    "2025-07-18", "2025-07-19", "2025-07-20"
];

$audiencesParChaine = [];
$occurencesParChaine = [];

$baseUrl = "https://debut-loic.fr/top-tele/api/get_audiences.php"; // ⚠️ adapter si besoin

foreach ($dates as $date) {
    $url = $baseUrl . "?dateForm=" . $date;
    $json = file_get_contents($url); // @ pour éviter warning si erreur
    $data = json_decode($json, true);

    if (!$data || isset($data["error"])) {
        continue; // ignorer les erreurs ou pages absentes
    }

    foreach ($data as $item) {
        if (!isset($item["chaine"]) || !isset($item["audience"])) continue;

        $chaine = $item["chaine"];
        $audience = floatval(str_replace(" ", "", $item["audience"]));

        if (!isset($audiencesParChaine[$chaine])) {
            $audiencesParChaine[$chaine] = 0;
            $occurencesParChaine[$chaine] = 0;
        }

        $audiencesParChaine[$chaine] += $audience;
        $occurencesParChaine[$chaine] += 1;
    }
}
// Préparer le tableau final
$resultats = [];
foreach ($audiencesParChaine as $chaine => $somme) {
    $moyenne = $somme / $occurencesParChaine[$chaine];
    $resultats[] = [
        "chaine" => $chaine,
        "moyenne_audience" => round($moyenne)
    ];
}

// Trier par moyenne décroissante
usort($resultats, function($a, $b) {
    return $b["moyenne_audience"] <=> $a["moyenne_audience"];
});

// Ajouter info semaine
$output = [
    "semaine" => "14 au 20 juillet 2025",
    "classement" => $resultats
];

// JSON final
echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>