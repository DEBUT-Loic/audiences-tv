<?php
header("Content-Type: application/json; charset=utf-8");
$moisTab = array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");

$month = "";
$year = "";

if(!empty($_GET["month"]) && !empty($_GET["year"])) {
    $month = $_GET["month"];
    $year = $_GET["year"];
}

$startOfMonth = new DateTime("$year-$month-01");

$lastDay = new DateTime("$year-$month-01");
$lastDay->modify("last day of this month");

$dates = [];
while ($startOfMonth->format("Y-m-d") != $lastDay->format("Y-m-d")) {
    $dates[] = $startOfMonth->format("Y-m-d"); // format de date, ex : 2025-07-21
    $startOfMonth->modify("+1 day");
}

$audiencesParChaine = [];

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
        }

        $audiencesParChaine[$chaine] += $audience;
    }
}
// Préparer le tableau final
$resultats = [];
$ttl = 0;
foreach ($audiencesParChaine as $chaine => $somme) {
    $moyenne = $somme / count($dates);
    $roundMoy = round($moyenne);
    $resultats[] = [
        "chaine" => $chaine,
        "moyenne_audience" => $roundMoy
    ];
}

// Trier par moyenne décroissante
usort($resultats, function($a, $b) {
    return $b["moyenne_audience"] <=> $a["moyenne_audience"];
});

$titleMonth = ucfirst($moisTab[intval($month - 1)])." ".$year;

// Ajouter info semaine
$output = [
    "mois" => $titleMonth,
    "classement" => $resultats
];

// JSON final
echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>