<?php
header("Content-Type: application/json; charset=utf-8");
$moisTab = array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");

function fetchUrlContent($url, $timeout = 10) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');

    $response = curl_exec($ch);

    curl_close($ch);

    return $response;
}

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
    $json = fetchUrlContent($url, 10);
    
    if ($json === false) {
        // page absente ou timeout, passer à la date suivante
        continue;
    }

    $data = json_decode($json, true);

    if (!$data || isset($data["error"])) {
        continue;
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
    "mois" => [$titleMonth],
    "classement" => $resultats
];

if(!empty($_GET["month"]) && !empty($_GET["year"])) {
    $output["mois"][] = "$year-$month";
}

// JSON final
echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>