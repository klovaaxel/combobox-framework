import dts from "bun-plugin-dts";

await Bun.build({
    entrypoints: ["./src/combobox-framework.ts"],
    outdir: "./dist",
    minify: true,
    plugins: [dts()],
});
