<style global lang="postcss">
	@tailwind base; @tailwind components; @tailwind utilities;
  
</style>

<script lang="ts">
	import Loading from "../component/ui/loading.svelte";

  let loading = false
  async function getCheese(searchTerm:string) {
    return await fetch('/cheese/chatKI/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ searchTerm })
    })
    }

    async function handleSumbit(searchTerm:string) {
      if(loading) return
      if(!searchTerm) return
      loading = true
      data = await (await (await getCheese(searchTerm)).json()).answer
      loading = false
    }
    let data = '';


</script>


<html lang="en" data-theme="pastel">

<div class="flex flex-col items-center justify-center w-full">
    <h1 class="text-xl font-extrabold font-sans m-8">Welcher Käse passt zu meinem Wein?</h1>
    <div class="form-control w-full max-w-md rounded-sm">
        <input type="text" placeholder="Um welchen Wein geht es?" class="input input-bordered w-full" on:change={(e)=>{ 
          handleSumbit(e.currentTarget.value)
        }}/>
      </div>
     
      {#if loading}
        <div class="flex flex-col items-center justify-center w-full m-12">
          <Loading />
        </div>
      {/if}
      {#await data}
      
        
      {:then data}
        <p class="m-12 text-xl font-thin w-3/4 whitespace-pre-line">{data}</p>
      {/await}
    </div>
</html>

