<style global lang="postcss">
	@tailwind base; @tailwind components; @tailwind utilities;
  
</style>

<script lang="ts">
	import Loading from "../component/ui/loading.svelte";

  let loading = false
  async function getCheese(searchTerm:string):string {
    try {
      const KIRes: Response = await fetch('/cheese/chatKI/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ searchTerm })
    })
    
    if (KIRes.status > 299) {
      console.log('Error: ', KIRes.status)
      throw new Error("Nope");
    }
    if (!KIRes) {
     throw new Error("Nope");
      
    }
    
    loading = false
    return await handleChatResponse(KIRes) || '';
    } catch (error) {
      loading = false
      console.log(error)
      return ('Ich habe leider keine Antwort für dich.') 
    }
    
    }

   async function handleChatResponse (completion: Response) {
    const resData = completion.body;
    
    if (!resData) {
      console.log('Abort handler');
      return;
    }

    let chatResponse= ''

    const reader = resData.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chatResponse += value
      console.log(chatResponse)
    }
    loading = false
    
    return chatResponse || ''
  }
  let data = ''
  async function handleSumbit(searchTerm:string) {
      if(loading) return
      if(!searchTerm) return
      loading = true
      data = getCheese(searchTerm)
   
  }
  
  

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

