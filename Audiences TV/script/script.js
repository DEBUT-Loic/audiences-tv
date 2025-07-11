function numStr(a, b) {
        a = '' + a;
        b = b || ' ';
        var c = '',
        d = 0;
    while (a.match(/^0[0-9]/)) {
        a = a.substr(1);
    }
    for (var i = a.length-1; i >= 0; i--) {
        c = (d != 0 && d % 3 == 0) ? a[i] + b + c : a[i] + c;
        d++;
    }
    return c;
}

function deleteAccent(a) {
    return a.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function srcImg(string) {
    return deleteAccent(string.replaceAll(" ","-").toLowerCase());
}

async function loadLinks() {
    const res  = await fetch('api/get_audiences.php');
    const data = await res.json();
    const table = document.querySelector('#audiences');
    
    let rang=1;
    let total = data.length;
    data.forEach((elem) => {
        let stringHTML = "";
        const tr = document.createElement("tr");
        const classTr =
        rang < 4 ? "podium" :
        rang < total - 2 ? "milieu" : "fin";

        tr.setAttribute("class",classTr);

        stringHTML += `
            <td class="rang">${rang==1 ? rang+"<sup>er</sup>" : rang+"<sup>e</sup>"}</td>
            <td class="chaine"> <img src="img/${srcImg(elem.chaine)}.png" alt="${elem.chaine}" /> </td>
            <td class="programme">${elem.programme}</td>
            <td class="telespectateur">${numStr(elem.audience)}</td>
            <td class="pda">${elem.pda}</td>
            `;

        rang++;

        tr.innerHTML = stringHTML;
        table.append(tr);
    });
}

window.addEventListener('DOMContentLoaded',loadLinks);