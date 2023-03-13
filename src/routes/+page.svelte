<style global lang="postcss">
	@tailwind base; @tailwind components; @tailwind utilities;
</style>

<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;
    console.log(data)
</script>


<html lang="en" data-theme="pastel">

<div class="flex flex-col items-center justify-center w-full">
    <h1 class="text-xl font-extrabold font-sans m-8">Welcher Käse passt zu meinem Wein?</h1>
    <div class="form-control w-full max-w-md rounded-sm">
        <input type="text" placeholder="Type here" class="input input-bordered w-full" />
      </div>
     
      {#await data}
        <p class="m-12 text-lg font-thin">{data.content}</p>
      {/await}
    </div>
</html>

