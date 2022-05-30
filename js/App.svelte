<script>
	export let tweets;
    export let faces;
</script>

<main>
	<h1>best faces</h1>
    <div class="grid">
        {#each tweets as tweet}
            <div class="grid-item">
                <img src={tweet.media.url} alt={tweet.media.media_key} />
                <h3>{tweet.tweet.public_metrics.like_count}</h3>
                <span>{JSON.stringify(tweet)}</span>
                {#if faces[`facesFor${tweet.tweet.id}`].length > 0}
                    {#each faces[`facesFor${tweet.tweet.id}`] as face}
                        <img src={face} alt="face" />
                    {/each}
                {:else}
                    <p>No faces detected :(</p>
                {/if}
            </div>
        {/each}
    </div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}
	h1 {
		font-size: 4em;
		font-weight: 100;
	}
    .grid {
        display: flex;
        flex-wrap: wrap;
    }
    .grid-item {
        width: 20%;
        margin: 2.5%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    img {
        max-width: 200px;
        max-height: 200px;
        margin: 1em;
        min-width: 100px;
        min-height: 100px;
    }
    span {
        word-break: break-all;
    }
</style>