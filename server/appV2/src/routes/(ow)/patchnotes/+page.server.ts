import { marked } from "marked";

export const prerender = true;

const files = import.meta.glob("/src/lib/patchnotes/*.md",{
    query: "?raw",
    import: "default",
    eager: true
}) as Record<string, string>

export function load(){
    const patches = Object.entries(files).map(([path, raw])=>{
        const  slug = path.split("/").pop()!.replace(".md","");
        return{
            slug,
            date: slug.slice(0,10),
            html: marked.parse(raw) as string
        };
    })
    .sort((a,b)=>b.date.localeCompare(a.date));
    return {patches};
}