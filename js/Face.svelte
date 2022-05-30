<script>
    export let tweet;
    export let face;
    export let index;

    export let show = () => showOriginal = true;
    export let hide = () => showOriginal = false;
    
    let showOriginal = false;
</script>

<a href={tweet.tweet.text}>
    <img src={showOriginal ? tweet.media.url : face} alt={`face-${tweet.tweet.id}-${index}`} on:mouseenter={show} on:mouseleave={hide} />
</a>

<style>
    a {
        margin: 1em;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    img {
        width: 200px;
    }
</style>