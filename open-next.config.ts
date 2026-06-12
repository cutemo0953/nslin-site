import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	// R2-backed incremental cache (bucket binding in wrangler.jsonc).
	incrementalCache: r2IncrementalCache,
});
