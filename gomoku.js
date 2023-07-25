// Raccourci pour le corps de la page HTML
var body = document.body;

// Variable globale contenant la taille de la grille jouée
var taille;

// Permet d'obtenir les coordonnées de la case sur laquelle le joueur a cliqué
var coordonnéesCaseCliquée = false;

// Retourne un tableau 2D d'entiers rempli de zéros de la taille de la grille jouée
function créerGrille() {
    let grille = [];
    
    for (let i = 0; i < taille; i++) {
        grille[i] = [];
    }

    for (let i = 0; i < taille; i++) {
        for (let j = 0; j < taille; j++) {
            grille[i][j] = 0;
        }
    }

    return grille;
}

// Crée le plateau de jeu en HTML à partir du tableau 2D d'entiers représentant le plateau de jeu et l'affiche
// À chaque tour, la grille HTML est recréée, mais cela ne réduit pas la performance
function afficherGrille(grille) {
    let table = document.createElement('table');
    
    for (let i = 0; i < taille; i++) {
        table.appendChild(document.createElement('tr'));
    }

    for (let i = 0; i < taille; i++) {
        for (let j = 0; j < taille; j++) {
            let td = document.createElement('td');

            // Chaque div représente un pion. Si la case est vide, le pion est blanc donc invisible
            let div = document.createElement('div'); //div.innerText = [i, j];

            switch (grille[i][j]) {
                case 0:
                    div.className = 'vide';

                    // Une case vide met ses coordonnées dans une variable globale quand on clique dessus
                    td.onclick = function() { coordonnéesCaseCliquée = [i, j]; };
                    break;
                case 1: div.className = 'joueur1'; break;
                case 2: div.className = 'joueur2'; break;
            }

            td.appendChild(div);
            table.children[i].appendChild(td);
        }
    }

    body.innerHTML = '';
    body.appendChild(table);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Attend une action de l'humain et renvoie les coordonnées de la case sur laquelle il a cliqué
// sous la forme d'un tableau de deux entiers « [ligne, colonne] »
async function tourHumain() {
    while (true) {
        if (coordonnéesCaseCliquée) {
            console.log('Vous avez cliqué sur ' + coordonnéesCaseCliquée);
            let coordonnéesÀJouer = coordonnéesCaseCliquée;
            coordonnéesCaseCliquée = false;
            return coordonnéesÀJouer;
        }
        await sleep(100);
    }
}

// Retourne vrai si le coup joué aux coordonnées passées en argument fait partie d'un alignement
// de 5 pions en ligne, colonne ou diagonale. On regarde uniquement les cases autour de la case
// passée en argument dans un rayon de 4 cases, ce qui est plus efficace que de parcourir toute
// la grille.
function testVictoire(grille, ligneDuCoup, colonneDuCoup) {
    // On obtient le type de pion (1 ou 2) qu'on vérifie
    let joueurActuel = grille[ligneDuCoup][colonneDuCoup];

    // Des compteurs pour le nombre de pions alignés sur les 4 directions
    let nombreEnLigne = 1;
    let nombreEnColonne = 1;
    let nombreEnDiagonaleNOSE = 1; // Sur la diagonale nord-ouest sud-est
    let nombreEnDiagonaleNESO = 1; // Sur la diagonale nord-est sud-ouest

    // Dès qu'on rencontre un pion de l'autre couleur ou une case vide, on arrête de prendre en compte
    // cette direction
    let nordConsécutif = true, nordEstConsécutif = true, estConsécutif = true, sudEstConsécutif = true;
    let sudConsécutif = true, sudOuestConsécutif = true, ouestConsécutif = true, nordOuestConsécutif = true;

    // Dans un rayon de 1 à 4, on regarde les cases dans les 8 directions sans dépasser les limites de la grille
    for (let décalage = 1; décalage <= 4; décalage++) {
        if (nordConsécutif && ligneDuCoup - décalage >= 0) {
            if (grille[ligneDuCoup - décalage][colonneDuCoup] == joueurActuel) nombreEnColonne++;
            else nordConsécutif = false;
        }
        if (nordEstConsécutif && ligneDuCoup - décalage >= 0 && colonneDuCoup + décalage < taille) {
            if (grille[ligneDuCoup - décalage][colonneDuCoup + décalage] == joueurActuel) nombreEnDiagonaleNESO++;
            else nordEstConsécutif = false;
        }
        if (estConsécutif && colonneDuCoup + décalage < taille) {
            if (grille[ligneDuCoup][colonneDuCoup + décalage] == joueurActuel) nombreEnLigne++;
            else estConsécutif = false;
        }
        if (sudEstConsécutif && ligneDuCoup + décalage < taille && colonneDuCoup + décalage < taille) {
            if (grille[ligneDuCoup + décalage][colonneDuCoup + décalage] == joueurActuel) nombreEnDiagonaleNOSE++;
            else sudEstConsécutif = false;
        }
        if (sudConsécutif && ligneDuCoup + décalage < taille) {
            if (grille[ligneDuCoup + décalage][colonneDuCoup] == joueurActuel) nombreEnColonne++;
            else sudConsécutif = false;
        }
        if (sudOuestConsécutif && ligneDuCoup + décalage < taille && colonneDuCoup - décalage >= 0) {
            if (grille[ligneDuCoup + décalage][colonneDuCoup - décalage] == joueurActuel) nombreEnDiagonaleNESO++;
            else sudOuestConsécutif = false;
        }
        if (ouestConsécutif && colonneDuCoup - décalage >= 0) {
            if (grille[ligneDuCoup][colonneDuCoup - décalage] == joueurActuel) nombreEnLigne++;
            else ouestConsécutif = false;
        }
        if (nordOuestConsécutif && ligneDuCoup - décalage >= 0 && colonneDuCoup - décalage >= 0) {
            if (grille[ligneDuCoup - décalage][colonneDuCoup - décalage] == joueurActuel) nombreEnDiagonaleNOSE++;
            else nordOuestConsécutif = false;
        }

        // Si au moins une des 4 directions a 5 pions alignés, on retourne vrai, faux sinon
        if (nombreEnLigne >= 5 || nombreEnColonne >= 5 || nombreEnDiagonaleNOSE >= 5 || nombreEnDiagonaleNESO >= 5) {
            return true;
        }
    }
    return false;
}

function fonctionDÉvaluation() {
    return 0;
}

// Retourne l'utilité du meilleur coup possible du joueur max dans la grille passée en argument
function maxValueAlphaBeta(grille, numéroDuJoueurMax, tour, profondeur, ligneDuCoupDuJoueurMin,
    colonneDuCoupDuJoueurMin, alpha, beta) {
    // On obtient le numéro du joueur min à partir de celui du joueur max avec
    // la fonction « f(x) = x mod 2 + 1 » qui transforme 1 en 2 et 2 en 1
    let numéroDuJoueurMin = numéroDuJoueurMax % 2 + 1;

    // ========== Début des tests terminaux
    // On vérifie si le joueur min vient de gagner dans cette simulation, en utilisant
    // les coordonnées du coup qu'il vient de jouer
    if (testVictoire(grille, ligneDuCoupDuJoueurMin, colonneDuCoupDuJoueurMin)) return -1;

    // On vérifie si la grille est pleine, et vu que le test terminal juste au-dessus a échoué,
    // avoir la grille pleine correspond à un match nul
    if (tour == taille ** 2 + 1) return 0;

    // À chaque appel récursif, on décrémente la profondeur de récursion de 1.
    // Lorsque la profondeur de récursion atteint 0, on effectue un « cutoff » avec la fonction
    // d'évaluation (heuristique), qui dans notre cas n'est pas programmée et retourne toujours 0
    if (profondeur == 0) return fonctionDÉvaluation();
    // ========== Fin des tests terminaux

    // Contient à tout moment la plus haute utilité trouvée jusqu'à présent parmi les fils de l'appel
    // de fonction actuel, cette variable est nommée « v » dans l'algorithme vu en cours
    let maximumDesMinimums = -1000;

    // Pour trouver les actions possibles, on parcourt la grille ligne par ligne et on garde uniquement
    // les cases qui contiennent un 0 et sont donc vides
    for (let i = 0; i < taille; i++) {
        for (let j = 0; j < taille; j++) {
            if (grille[i][j] == 0) {
                // On simule le coup en le plaçant sur la grille
                grille[i][j] = numéroDuJoueurMax;

                // On obtient l'utilité de la grille avec ce coup
                let résultatAppelMin = minValueAlphaBeta(grille, numéroDuJoueurMin,
                    tour + 1, profondeur - 1, i, j, alpha, beta);

                // On annule le coup en remettant un 0 dans la case
                grille[i][j] = 0;

                // Si l'utilité est de 1, le coup associé fait gagner max de manière certaine.
                // Il n'y a pas de coup avec une utilité plus élevée, on peut donc quitter immédiatement
                if (résultatAppelMin == 1) return 1;

                // On met à jour la plus haute utilité trouvée jusqu'à présent dans les fils si nécessaire
                maximumDesMinimums = Math.max(maximumDesMinimums, résultatAppelMin);

                // On applique l'élagage alpha-bêta
                if (maximumDesMinimums >= beta) return maximumDesMinimums;
                alpha = Math.max(alpha, maximumDesMinimums);
            }
        }
    }

    // On retourne la plus haute utilité trouvée parmi tous les fils
    return maximumDesMinimums;
}

// Retourne l'utilité du meilleur coup possible du joueur min dans la grille passée en argument
function minValueAlphaBeta(grille, numéroDuJoueurMin, tour, profondeur, ligneDuCoupDuJoueurMax,
    colonneDuCoupDuJoueurMax, alpha, beta) {
    let numéroDuJoueurMax = numéroDuJoueurMin % 2 + 1;

    if (testVictoire(grille, ligneDuCoupDuJoueurMax, colonneDuCoupDuJoueurMax)) return 1;
    if (tour == taille ** 2 + 1) return 0;
    if (profondeur == 0) return fonctionDÉvaluation();

    let minimumDesMaximums = 1000;

    for (let i = 0; i < taille; i++) {
        for (let j = 0; j < taille; j++) {
            if (grille[i][j] == 0) {
                grille[i][j] = numéroDuJoueurMin;
                let résultatAppelMax = maxValueAlphaBeta(grille, numéroDuJoueurMax,
                    tour + 1, profondeur - 1, i, j, alpha, beta);
                grille[i][j] = 0;

                if (résultatAppelMax == -1) return -1;

                minimumDesMaximums = Math.min(minimumDesMaximums, résultatAppelMax);

                if (minimumDesMaximums <= alpha) return minimumDesMaximums;
                beta = Math.min(beta, minimumDesMaximums);
            }
        }
    }

    return minimumDesMaximums;
}

// Retourne les coordonnées du meilleur coup possible pour l'IA, qui incarne le joueur max
// La profondeur passée est le nombre de coups à simuler au maximum
function tourAlphaBeta(grille, numéroDuJoueurMax, tour, profondeurPassée) {
    let numéroDuJoueurMin = numéroDuJoueurMax % 2 + 1;
    let maximumDesMinimums = -1000;
    let coordonnéesÀJouer;
    let alpha = -1000;

    for (let i = 0; i < taille; i++) {
        for (let j = 0; j < taille; j++) {
            if (grille[i][j] == 0) {
                grille[i][j] = numéroDuJoueurMax;
                let résultatAppelMin = minValueAlphaBeta(grille, numéroDuJoueurMin,
                    tour + 1, profondeurPassée - 1, i, j, alpha, 1000);
                console.log('Résultat alpha-bêta à ' + [i, j] + ' : ' + résultatAppelMin);
                grille[i][j] = 0;

                // Victoire certaine de l'IA donc on arrête tout et joue immédiatement à ces coordonnées
                if (résultatAppelMin == 1) return [i, j];

                if (résultatAppelMin > maximumDesMinimums) {
                    maximumDesMinimums = résultatAppelMin;
                    // On stocke les coordonnées du coup d'utilité la plus haute jusqu'à présent
                    coordonnéesÀJouer = [i, j];
                }

                alpha = Math.max(alpha, maximumDesMinimums);
            }
        }
    }
    console.log("L'IA a joué " + coordonnéesÀJouer);
    return coordonnéesÀJouer;
}

// Prend en argument la profondeur de récursion pour l'application de l'algorithme alpha-bêta
async function boucleDeJeu(profondeurPassée) {
    // On met la variable globale contenant la taille de la grille à la valeur choisie par l'utilisateur
    // sur l'écran titre
    taille = document.getElementById("tailleChoisie").value;

    // On crée le tableau 2D d'entiers rempli de zéros et on affiche la grille HTML vide correspondante
    let grille = créerGrille();
    afficherGrille(grille);

    // La variable tour contient 1 au premier tour (humain), 2 au deuxième tour (IA), et ainsi de suite.
    // Elle sert à faire jouer l'humain 1 tour sur 2, et l'IA 1 tour sur 2.
    // Le numéro du tour est également utilisé ici dans la boucle de jeu, ainsi que dans les fonctions alpha-bêta,
    // afin de savoir si la grille est remplie. En effet, la grille peut contenir au maximum taille² pions.
    let tour = 0;
    while (++tour <= taille ** 2) {
        let joueurActuel;
        let coordonnéesJouées;
        if (tour % 2) {
            joueurActuel = 1;
            coordonnéesJouées = await tourHumain();
        } else {
            joueurActuel = 2;
            // On donne à l'algorithme alpha-bêta la profondeur de récursion choisie par l'utilisateur
            // sur l'écran titre, qui est le nombre de coups à simuler au maximum
            coordonnéesJouées = tourAlphaBeta(grille, joueurActuel, tour, profondeurPassée);
        }
        // On place sur le tableau 2D d'entiers le coup joué par le joueur, qu'il soit humain ou IA
        grille[coordonnéesJouées[0]][coordonnéesJouées[1]] = joueurActuel;
        // Puis on affiche la grille avec ce nouveau coup
        afficherGrille(grille);

        // Si ce coup fait gagner le joueur, on affiche un message de victoire et la partie est terminée
        if (testVictoire(grille, coordonnéesJouées[0], coordonnéesJouées[1])) {
            let h1 = document.createElement('h1');
            h1.innerText = 'Victoire du joueur ' + joueurActuel;
            body.prepend(h1);
            return;
        }
    }

    // Si aucun coup n'a fait gagner un joueur, on sort de la boucle while par sa condition « tant que
    // la grille n'est pas remplie » et on a donc un match nul avec une grille remplie
    let h1 = document.createElement('h1');
    h1.innerText = 'Match nul';
    body.prepend(h1);
}

function afficherÉcranTitre() {
    body.innerHTML = `
        <h1>Gomoku - Projet IA</h1>
        Choisissez la taille de la grille :
        <input type='number' id='tailleChoisie' value='10' placeholder='10'>
        <br><br><br>
        Et choisissez une difficulté :
        <button onclick='boucleDeJeu(3);'>Facile</button>
        <button onclick='boucleDeJeu(4);'>Normal</button>
        <button onclick='boucleDeJeu(5);'>Difficile</button>
        <br><br><br>
        Ou choisissez une profondeur de récursion manuellement :
        <input type='number' id='profondeurChoisie' value='4' placeholder='4'>
        <button onclick='
            boucleDeJeu(document.getElementById("profondeurChoisie").value);
        '>Jouer avec cette profondeur</button>
    `;
}

afficherÉcranTitre();
