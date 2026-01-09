<script>
    export let team ="";
    export let name;
    export let main;
    export let role ="";
    

</script> 
 
 
    {#if team.toLowerCase() === "blue"}
   
    <div  class="max-h-[90%] max-w-[20%] flex justify-end bg-blue-700/50">
        <div class="flex flex-1 flex-col overflow-hidden ">
            <div class="flex-1 flex max-w-full items-center overflow-hidden ">
                <span class= "font-arial text-white text-[30px] p-0 m-0 leading-none inline-block pl-2 justify-start overflow-hidden" > {name}</span>
            </div>
            <div class="flex max-w-full h-[18px] overflow-hidden bg-[#000000aa] pr-1 justify-end">
                <span class= "flex-1 flex font-arial text-white w-full text-[15px] p-0 m-0 leading-none inline-block pl-2 text-end" > {role}</span>
            </div>
        </div>        
        <div class="h-full">
            <img src={main} alt="" class= "h-full flex aspect-square object-contain"/>
        </div>
  
    </div>

    {:else}
    
    <div  class="max-h-[90%] max-w-[20%] flex justify-end bg-red-700/50">
        <div  class="h-full">
            <img src={main} alt="" class= "h-full flex aspect-square object-contain"/>
        </div>
        <div class="flex flex-1 flex-col overflow-hidden "> 
            <div class="flex-1 flex max-w-full items-center overflow-hidden ">
                <span class= "font-arial text-white text-[30px] p-0 m-0 leading-none inline-block pl-2 justify-end overflow-hidden" > {name}</span>
            </div>
            <div class="flex max-w-full h-[18px] overflow-hidden bg-[#000000aa] pr-1">
                <span class= "flex-1 flex font-arial text-white w-full text-[15px] p-0 m-0 leading-none inline-block pl-2 justify-start" > {role}</span>
            </div>
        </div>                
    </div>
    {/if}
