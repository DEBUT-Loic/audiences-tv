<?php
header('Content-Type: application/json; charset=utf-8');
$moisTab = array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");

$week = "";
$year = "";

if(!empty($_GET["week"]) && !empty($_GET["year"])) {
    $week = $_GET["week"];
    $year = $_GET["year"];
}

$startOfWeek = new DateTime();
$startOfWeek->setISODate($year, $week);

$firstDate = $startOfWeek->format("j");
$firstMonth = $moisTab[$startOfWeek->format("n") - 1];
$firstYear = $startOfWeek->format("Y");

$dates = [];

for ($i = 0; $i < 7; $i++) {
    $dates[] = $startOfWeek->format("Y-m-d"); // format de date, ex : 2025-07-21
    $startOfWeek->modify("+1 day");
}

$startOfWeek->modify("-1 day");
$lastDate = $startOfWeek->format("j");
$lastMonth = $moisTab[$startOfWeek->format("n") - 1];
$lastYear = $startOfWeek->format("Y");

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

$titleWeek = "";

if($firstYear != $lastYear) {
    $titleWeek = $firstDate." ".$firstMonth." ".$firstYear;
}
else if($firstMonth != $lastMonth) {
    $titleWeek = $firstDate." ".$firstMonth;
}
else {
    $titleWeek = $firstDate;
}

$titleWeek .= " au ".$lastDate." ".$lastMonth." ".$lastYear;

// Ajouter info semaine
$output = [
    "semaine" => $titleWeek,
    "classement" => $resultats
];

// JSON final
echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>