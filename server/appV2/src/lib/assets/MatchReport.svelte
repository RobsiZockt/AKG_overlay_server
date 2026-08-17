<script>
//@ts-ignore
    let {match={}} =$props();

    const game={
        "LOL":{logo:"/img/icons/lol.svg",name:"League of Legends"},
        "OW":{logo:"/img/icons/overwatch_logo.svg",name:"Overwatch"},
        "RL":{logo:"/img/icons/rocket_league.svg",name:"Rocket League"},
        "CS":{logo:"/img/icons/counter_strike_logo.webp",name:"Counterstrike"}
    }
</script>

<div class="">
<div class="flex">
<img src={game[match.game].logo} alt=""/>
<span>{game[match.game].name}</span>
<img src={liga[match.game].logo} alt=""/>
<span>{match.liga}</span>
{#if match.live}
<span>LIVE</span>
{/if}
</div>

</div>
