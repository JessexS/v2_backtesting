import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const REPO_NAME = "backtesting"; // <-- vaihda tähän oman repon nimi

export default defineConfig({
  plugins: [svelte()],
  base: process.env.GITHUB_PAGES ? `/${REPO_NAME}/` : "/"
});
