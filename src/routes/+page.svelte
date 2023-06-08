<style global lang="postcss">
	@tailwind base; @tailwind components; @tailwind utilities;
  
</style>

<script lang="ts">

  let data = ''

  async function getCheese(searchTerm:string):Promise<string> {
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
      return await handleChatResponse(KIRes) || ''
    } catch (error) {
      console.log(error)
      return 'Ups, das weiß ich nicht..'
      }
    }

 async function handleChatResponse (completion: Response) {
    const resData = completion.body;    
    if (!resData) {
      console.log('Abort handler');
      return;
    }
    const reader = resData.pipeThrough(new TextDecoderStream()).getReader();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      data += value
      
    }
    return data
  }
  
  async function handleSumbit(searchTerm:string) {
      if(!searchTerm) return
     data =  await getCheese(searchTerm)   
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
     
        <p class="m-12 text-xl font-thin w-3/4 whitespace-pre-line">{data}</p>
      <footer class="w-full">
        <hr class="w-full"/>
        <div class="font-extralight text-xs m-2 justify-center flex">
          <div>&copy; 2023 &nbsp;</div>
          
          <a href='https://berlinersoftwareschmiede.de'>Berliner Softwareschmiede</a>
        </div>
      </footer>
    </div>
</html>

