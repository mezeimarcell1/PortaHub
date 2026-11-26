let latogatok = [];
let telefonok = [];
let kilepesek = [];
let szolgalatok = [];
let naplo = [];
let uzenetek = [];

function taroltAdatokBetoltese(kulcs) {
    const adat = localStorage.getItem(kulcs);

    if (adat === null) {
        return [];
    }

    try {
        return JSON.parse(adat);
    } catch {
        return [];
    }
}

function adatokBetoltese() {
    latogatok = taroltAdatokBetoltese("mechwart_latogatok");
    telefonok = taroltAdatokBetoltese("mechwart_telefonok");
    kilepesek = taroltAdatokBetoltese("mechwart_kilepesek");
    szolgalatok = taroltAdatokBetoltese("mechwart_szolgalatok");
    naplo = taroltAdatokBetoltese("mechwart_naplo");
    uzenetek = taroltAdatokBetoltese("mechwart_uzenetek");
}

function adatokMentese() {
    localStorage.setItem("mechwart_latogatok", JSON.stringify(latogatok));
    localStorage.setItem("mechwart_telefonok", JSON.stringify(telefonok));
    localStorage.setItem("mechwart_kilepesek", JSON.stringify(kilepesek));
    localStorage.setItem("mechwart_szolgalatok", JSON.stringify(szolgalatok));
    localStorage.setItem("mechwart_naplo", JSON.stringify(naplo));
    localStorage.setItem("mechwart_uzenetek", JSON.stringify(uzenetek));
}

function jelenlegiIdo() {
    return new Date().toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function ujAzonosito() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function uzenetMutatasa(szoveg) {
    const elem = document.getElementById("toast");
    elem.textContent = szoveg;
    elem.classList.add("lathato");

    setTimeout(function () {
        elem.classList.remove("lathato");
    }, 2200);
}

function frissitMindent() {
    // A megjelenites a kesobbi commitokban keszul el.
}

adatokBetoltese();
function oldalMegnyitasa(oldalNeve) {
    document.querySelectorAll(".oldal").forEach(function (oldal) {
        oldal.classList.remove("aktiv");
    });

    document.querySelectorAll(".menu-gomb").forEach(function (gomb) {
        gomb.classList.remove("aktiv");
    });

    const kivalasztottOldal = document.getElementById("page-" + oldalNeve);

    if (kivalasztottOldal) {
        kivalasztottOldal.classList.add("aktiv");
    }

    const kivalasztottGomb = document.querySelector('[data-page="' + oldalNeve + '"]');

    if (kivalasztottGomb) {
        kivalasztottGomb.classList.add("aktiv");
        document.getElementById("breadcrumbText").textContent = kivalasztottGomb.textContent;
    }
}

document.querySelectorAll(".menu-gomb").forEach(function (gomb) {
    gomb.addEventListener("click", function () {
        oldalMegnyitasa(gomb.dataset.page);
    });
});

document.querySelectorAll(".gyors-gomb").forEach(function (gomb) {
    gomb.addEventListener("click", function () {
        oldalMegnyitasa(gomb.dataset.go);
    });
});

function biztonsagosSzoveg(szoveg) {
    return String(szoveg).replace(/[&<>"']/g, function (karakter) {
        const karakterek = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return karakterek[karakter];
    });
}

function uresTabla(tbodyId, oszlopok, szoveg) {
    document.getElementById(tbodyId).innerHTML =
        '<tr><td colspan="' + oszlopok + '">' + szoveg + '</td></tr>';
}

function latogatokMegjelenitese() {
    const aktivLatogatok = latogatok.filter(function (latogato) {
        return !latogato.tavozott;
    });

    document.getElementById("visitorCount").textContent = aktivLatogatok.length + " fő";
    const tabla = document.getElementById("visitorTable");

    if (aktivLatogatok.length === 0) {
        uresTabla("visitorTable", 4, "Jelenleg nincs bent látogató.");
        return;
    }

    tabla.innerHTML = aktivLatogatok.map(function (latogato) {
        return '<tr>' +
            '<td>' + biztonsagosSzoveg(latogato.nev) + '</td>' +
            '<td>' + biztonsagosSzoveg(latogato.kitKeres) + '</td>' +
            '<td>' + latogato.erkezes + '</td>' +
            '<td><button class="kis-gomb" data-action="latogato-tavozott" data-id="' + latogato.id + '">Távozott</button></td>' +
            '</tr>';
    }).join("");
}

document.getElementById("visitorForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    const latogato = {
        id: ujAzonosito(),
        nev: document.getElementById("visitorName").value.trim(),
        kitKeres: document.getElementById("visitorHost").value.trim(),
        cel: document.getElementById("visitorReason").value,
        erkezes: jelenlegiIdo(),
        tavozott: false
    };

    latogatok.push(latogato);
    adatokMentese();
    frissitMindent();
    this.reset();
    uzenetMutatasa("A látogató rögzítése sikerült.");
});

function telefonokMegjelenitese() {
    const varakozoTelefonok = telefonok.filter(function (telefon) {
        return !telefon.visszaadva;
    });

    document.getElementById("phoneCount").textContent = varakozoTelefonok.length + " db";
    const tabla = document.getElementById("phoneTable");

    if (varakozoTelefonok.length === 0) {
        uresTabla("phoneTable", 4, "Nincs visszaadásra váró telefon.");
        return;
    }

    tabla.innerHTML = varakozoTelefonok.map(function (telefon) {
        return '<tr>' +
            '<td>' + biztonsagosSzoveg(telefon.nev) + '</td>' +
            '<td>' + biztonsagosSzoveg(telefon.osztaly) + '</td>' +
            '<td>' + biztonsagosSzoveg(telefon.hely) + '</td>' +
            '<td><button class="kis-gomb" data-action="telefon-visszaadva" data-id="' + telefon.id + '">Visszaadva</button></td>' +
            '</tr>';
    }).join("");
}

document.getElementById("phoneForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    telefonok.push({
        id: ujAzonosito(),
        nev: document.getElementById("phoneStudent").value.trim(),
        osztaly: document.getElementById("phoneClass").value.trim(),
        hely: document.getElementById("phonePlace").value.trim(),
        ido: jelenlegiIdo(),
        visszaadva: false
    });

    adatokMentese();
    frissitMindent();
    this.reset();
    uzenetMutatasa("A telefon átvétele rögzítve.");
});
