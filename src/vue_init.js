const app = Vue.createApp({
    data() {
        return {data:null};
    },
    mounted() {
        let data = [];
        d3.csv("data/feuxUSA.csv").then(fires => {
            fires.forEach(e => data.push(e));
        });
        console.log(data);
        this.data = data;
    }
});


app.component('card', {
    props: ['title'],
    template: `<div class="card">
                    <div class="card-header">
                        {{ title }}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Special title treatment</h5>
                        <p>A chart here</p>
                    </div>
                </div>`
});

app.mount("#app");