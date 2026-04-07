<script>
    export let team ="";
    export let name;
    export let main;
    export let extra;
    export let role ="";
    export let slot;
    

    let role_icon = "";

$: if(slot === 1) role_icon = "../img/icons/Tank_icon.svg";
    else if(slot === 2 || slot === 3) role_icon = "../img/icons/Damage_icon.svg";
    else if(slot === 4 || slot === 5) role_icon = "../img/icons/Support_icon.svg";
    else role_icon="";
</script> 
 
 
 <div  class="h-max-[15vh] flex flex-1 w-full">
    {#if team.toLowerCase() === "blue"}
    <div class="h-[15vh] flex flex-1 flex-col w-full bg-gradient-to-l from-blue-700 to-transparent">
        <div class="h-[80%] w-full flex flex-1">
            <div class=" flex w-full items-center justify-end">
                <span class= "font-arial text-white text-[55px] p-0 m-0 leading-none inline-block pr-2 "> {name}</span>
            </div>
            <img class="flex aspect-square object-contain" alt="" src={main}/>
        </div>
        <div class="h-[20%] bg-[#000000aa] flex flex-row w-full ">
            <div class="h-full w-[50%] flex justify-start">
                <span class= "font-arial text-[#35a652] text-[23px] p-0 m-0 leading-none inline-block pl-4"> {extra}</span>
            </div>
            <div class="h-full w-[50%] flex justify-end">
                <span class= "font-arial text-white text-[23px] p-0 m-0 leading-none inline-block "> {role}</span>
            </div> 
        </div>
    </div>
    <div class="max-w-[7%] h-full flex flex-1 bg-blue-700">
        <div class="bg-[#000000aa]">
            <img class="h-full w-full items-center justify-center p-2" alt="" src={role_icon}/>
        </div>
    </div>
    {:else}
    <div class="h-[15vh] flex flex-1 w-full" >
        <div class="max-w-[7%] h-full flex flex-1 bg-red-700">
            <div class="bg-[#000000aa]">
                <img class="h-full w-full items-center justify-center p-2" alt="" src={role_icon}/>
            </div>
        </div>
        <div class="h-[15vh] flex flex-1 flex-col w-full bg-gradient-to-r from-red-700 to-transparent">
            <div class="h-[80%] w-full flex flex-1">
                <img src={main} alt="" class= " flex aspect-square object-contain"/>
                <div class=" flex w-full justify-start items-center">
                    <span class= "font-arial text-white text-[55px] p-0 m-0 leading-none inline-block pr-2 " > {name}</span>
                </div>
            </div>
            <div class="h-[20%] bg-[#000000aa] flex flex-row w-full ">
                <div class="h-full w-[50%] flex justify-start">
                    <span class= "font-arial text-white text-[23px] p-0 m-0 leading-none inline-block " > {role}</span>
                </div>
                <div class="h-full w-[50%] flex justify-end">
                    <span class= "font-arial text-[#35a652] text-[23px] p-0 m-0 leading-none inline-block pr-4"> {extra}</span>
                </div>
            </div>
        </div>
    </div>
    {/if}
 </div>