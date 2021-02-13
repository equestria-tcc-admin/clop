const MILLISECONDS_IN_A_DAY = 86400000;

const app = Vue.createApp({
    data() {
        return {
            search: '',
            selected: '',
            cards: {},
            recipes: [],
            recipesResult: [],
            searchResult: [],
            searchFocus: false
        }
    },
    methods: {
        inputSearch: function () {
            this.searchFocus = true;
            this.searchResult = [];
            if (!this.search) return

            for (let key in this.cards) {
                const name = String(this.cards[key].name);
                if (!name) continue;

                if (String(name).toLowerCase().includes(this.search.toLowerCase())) {
                    this.searchResult.push({ id: key, name: this.cards[key].name });
                }
            }
        },
        select: function (card) {
            let scroll = document.querySelector('#scroll');
            if (scroll) {
                scroll.scrollTo(0, 0)
            }
            this.selected = card;
            this.recipesResult = [];

            window.location.hash = this.cards[card].id;

            for (let key in this.recipes) {
                if (this.recipes[key].includes(card)) {
                    this.recipesResult.push(this.recipes[key]);
                } else {
                    for (let id in this.recipes[key]) {
                        if (Array.isArray(this.recipes[key][id]) && this.recipes[key][id].includes(card)) {
                            this.recipesResult.push(this.recipes[key]);
                        }
                    }
                }
            }
        }
    },
    created: async function () {
        const date = Date.now();
        if (!localStorage.getItem('update') || localStorage.getItem('update') < date) {
            const apiCards = await fetch("https://www.equestria-tcc.ru/api/cards", { headers: { "API-Key": "e1c9d2bc5f2602ba94346603f59573b1" } });
            const apiRecipes = await fetch("https://www.equestria-tcc.ru/api/recipes", { headers: { "API-Key": "e1c9d2bc5f2602ba94346603f59573b1" } });

            if (apiCards.ok && apiRecipes.ok) {
                const cards = await apiCards.json();
                this.recipes = await apiRecipes.json();

                function compare(a, b) {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                }

                cards.push({ id: 'GENERAL', avatar: '/img/actors/nopony.png', name: 'Обычная карта', color: '#000', tags: ['GENERAL'] })
                cards.push({ id: 'FUSABLE', avatar: '/img/actors/nopony.png', name: 'Карта со сплошным краем', color: '#000', tags: ['FUSABLE'] })

                cards.sort(compare)

                for (let key in cards) {
                    this.cards[cards[key].id] = cards[key]
                }

                for (let key in this.recipes) {
                    for (let id in this.recipes[key]) {
                        if (!this.cards[this.recipes[key][id]] && !['GENERAL', 'FUSABLE', 'FILLY'].includes(this.recipes[key][id])) {
                            let tagCard = this.recipes[key][id]
                            this.recipes[key][id] = []
                            for (let tag in this.cards) {
                                if (this.cards[tag].tags && this.cards[tag].tags.includes(tagCard)) {
                                    this.recipes[key][id].push(this.cards[tag].id)
                                }
                            }
                        }
                    }
                }

                localStorage.setItem('cards', JSON.stringify(this.cards));
                localStorage.setItem('recipes', JSON.stringify(this.recipes));
                localStorage.setItem('update', date + MILLISECONDS_IN_A_DAY);
            }
        } else {
            this.cards = JSON.parse(localStorage.getItem("cards"))
            this.recipes = JSON.parse(localStorage.getItem("recipes"))
        }
        this.select(document.location.hash.slice(1) || 'spike');
    }
})

app.component('card', {
    props: ['card'],
    methods: {
        selected: function (card) {
            this.$root.select(card);
            this.$root.searchFocus = false;
        }
    },
    template: `<div v-if="!card" class="card no-card" style="background-image: url(https://www.equestria-tcc.ru/img/cards/symbol.png);"></div><div v-else-if="!card.avatar" @click="selected(card.id)" class="card pony-card" :title="card.name" :style="{'background-image': 'url(https://www.equestria-tcc.ru' + card.cover + ')', border: 'none', 'background-color': card.color}"></div><div v-else class="card pony-card" @click="selected(card.id)" :title="card.name" :style="[card.cover ? {backgroundImage: 'url(https://www.equestria-tcc.ru' + card.cover + ')', border: card.tags && !card.tags.includes('GENERAL') ? '3px solid' + card.color : '3px double' + card.color} : {border: card.tags && !card.tags.includes('GENERAL') ?  '3px solid white' : '3px double white'}, {backgroundColor: card.color}]"><span class="card-face" :style="{backgroundImage: 'url(https://www.equestria-tcc.ru' + card.avatar + ')'}"></span></div>`
});

const clop = app.mount('#app')

document.querySelector('#search').onfocus = () => {
    clop.searchFocus = true;
};