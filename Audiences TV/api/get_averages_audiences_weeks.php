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
    $moyenne = $somme / 7;
    $roundMoy = round($moyenne);
    $resultats[] = [
        "chaine" => $chaine,
        "moyenne_audience" => $roundMoy
    ];

    $ttl += $roundMoy;
}

// Trier par moyenne décroissante
usort($resultats, function($a, $b) {
    return $b["moyenne_audience"] <=> $a["moyenne_audience"];
});

$titleWeek = "";
$firstDate1er = $firstDate == "1" ? $firstDate."er" : $firstDate;
$lastDate1er = $lastDate == "1" ? $lastDate."er" : $lastDate;

if($firstYear != $lastYear) {
    $titleWeek = $firstDate1er." ".$firstMonth." ".$firstYear;
}
else if($firstMonth != $lastMonth) {
    $titleWeek = $firstDate1er." ".$firstMonth;
}
else {
    $titleWeek = $firstDate1er;
}

$titleWeek .= " au ".$lastDate1er." ".$lastMonth." ".$lastYear;

// Ajouter info semaine
$output = [
    "semaine" => [$titleWeek],
    "classement" => $resultats,
    "total_moyennes" => $ttl
];

if(!empty($_GET["week"]) && !empty($_GET["year"])) {
    $output["semaine"][] = "$year-W$week";
}

// JSON final
echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>