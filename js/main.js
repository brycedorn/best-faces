import App from './App.svelte';
import tweets from '../data/tweets-ranked.json';

import * as faces from './face-imports';

const app = new App({
	target: document.body,
	props: {
		tweets,
		faces
	}
});

export default app;