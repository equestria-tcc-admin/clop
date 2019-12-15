const MILLISECONDS_IN_A_DAY = 86400000;

let clop = new Vue({
    el: "#clop",
    data: {
        cards: {},
        recipes: "",
        search: "",
        searchResult: [],
        selected: "",
        recipesResult: [],
        searcha: ""
    },
    methods: {
        searchf() {
            clop.searcha = true;
            clop.searchResult = [];

            if (clop.search) {
                for (let key in clop.cards) {
                    const name = String(clop.cards[key].name);
                    if (!name) continue;

                    if (String(name).toLowerCase().includes(clop.search.toLowerCase())) {
                        clop.searchResult.push({id: key, name: clop.cards[key].name});
                    }
                }
            }

            clop.searchResult.sort(compare)
        },

        select(card) {
            Vue.set(clop, "selected", card);
            clop.recipesResult = [];

            if (card == "fluttergoth" || card == "hipstershy" || card == "severeshy") {
                clop.recipesResult.push(["ALTERSHY", "fluttershy", "white-card"]);
            }

            for (let key in clop.recipes) {
                if (clop.recipes[key].includes(card)) {
                    clop.recipesResult.push(clop.recipes[key]);
                }
            };
        }
    }
});

document.querySelector("#clop > header > input.search").onfocus = function() {
    clop.searcha = true;
};

(async function() {
    const date = Date.now();
    if (!localStorage.getItem("date") || localStorage.getItem("date") < date) {
        const apiCards = await fetch("https://www.equestria-tcc.ru/api/cards", {headers: {"API-Key": "e1c9d2bc5f2602ba94346603f59573b1"}});
        const apiRecipes = await fetch("https://www.equestria-tcc.ru/api/recipes", {headers: {"API-Key": "e1c9d2bc5f2602ba94346603f59573b1"}});

        if (apiCards.ok && apiRecipes.ok) {
            const cards = await apiCards.json();
            const recipes = await apiRecipes.json();
            const cardsStorage = JSON.stringify(cards);
            const recipesStorage = JSON.stringify(recipes);

            localStorage.setItem('date', date + MILLISECONDS_IN_A_DAY);
            localStorage.setItem('cards', cardsStorage);
            localStorage.setItem('recipes', recipesStorage);
            clop.recipes = recipes;

            for (let key in cards) Vue.set(clop.cards, cards[key].id, cards[key]);
        }
    } else {
        const cards = JSON.parse(localStorage.getItem("cards"))
        const recipes = JSON.parse(localStorage.getItem("recipes"))
        clop.recipes = recipes;
        for (let key in cards) Vue.set(clop.cards, cards[key].id, cards[key]);
    }

    Vue.set(clop.cards, 'GENERAL', {id: "GENERAL", avatar: "/img/actors/nopony.png", name: "Обычная карта", color: "#000", tags: ["GENERAL"]});
    Vue.set(clop.cards, 'FUSABLE', {id: "FUSABLE", avatar: "/img/actors/nopony.png", name: "Карта со сплошным краем", color: "#000", tags: ["FUSABLE"]});
    clop.select("spike");
})();

function compare(a,b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

Vue.component("card", {
    props: ["card"],
    methods: {
        selected: function (card) {
            clop.select(card);
            clop.searcha = false;
        }
    },
    template: `
    <div v-if="!card" class="card no-card" style="background-image: url(https://www.equestria-tcc.ru/img/cards/symbol.png);"></div>

    <div v-else-if="!card.avatar" v-on:click="selected(card.id)" class="card pony-card" v-bind:title="card.name" v-bind:style="{'background-image': 'url(https://www.equestria-tcc.ru' + card.cover + ')', border: 'none', 'background-color': card.color}"></div>

    <div v-on:click="selected(card.id)" v-else-if="card.tags && !card.tags.includes('GENERAL')" class="card pony-card" v-bind:title="card.name" v-bind:style="[card.cover ? {'background-image': 'url(https://www.equestria-tcc.ru' + card.cover + ')', border: '3px solid' + card.color,} : {border: '3px solid white'}, {'background-color': card.color}]">
      <div class="card-face" v-bind:style="{'background-image': 'url(https://www.equestria-tcc.ru' + card.avatar + ')'}"></div>
    </div>

    <div v-on:click="selected(card.id)" v-else class="card pony-card" v-bind:title="card.name" v-bind:style="[card.cover ? {'background-image': 'url(https://www.equestria-tcc.ru' + card.cover + ')', border: '3px double' + card.color,} : {border: '3px double white'}, {'background-color': card.color}]">
      <span class="card-face" v-bind:style="{'background-image': 'url(https://www.equestria-tcc.ru' + card.avatar + ')'}"></span>
    </div>`
});
