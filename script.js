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
