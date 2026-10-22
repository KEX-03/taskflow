import {useEffect} from "react"

// ── Page Title Handler — dynamically changes page title ─────────
export default function usePageTitle(pageName){
    useEffect(()=>{
        document.title = `${pageName} — TaskFlow`;
        return ()=>{
            document.title = "Taskflow"
        }
      },[pageName]);
}