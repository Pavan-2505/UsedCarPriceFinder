"use client";

import { BACKEND_WEBSOCKET } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import z from "zod";

interface ChatMessage {
    text: string;
}
const ValidFileObject = z.object({
    file_id: z.hex().length(32),
    original_name: z.string().refine((fname) => /^[A-Za-z0-9][A-Za-z0-9-/]+[A-Za-z0-9]\.csv$/.test(fname), 'Invalid File Name')
})

interface ErrorObject {
    metaError? : string[] | undefined,
    file_id? : string[] | undefined,
    original_name? : string[] | undefined,
}

const WebSocketComponent = ({ projectid }: { projectid: string }) => {
    const weRef = useRef<WebSocket | null>(null);
    const [message, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState<boolean>(false);
    const [error, setError] = useState<ErrorObject>({ metaError : undefined, file_id : undefined , original_name : undefined });
    useEffect(() => {
        const file = localStorage.getItem('file-path');
        if (!file) {
            console.log("File Error: ",file);
            setError(prev => ({...prev, metaError : ['Something went wrong!']}))
            return;
        }
        const fileJson = ValidFileObject.safeParse(JSON.parse(file));
        if(!fileJson.success){
            console.log("Parse Error: ",file,z.flattenError(fileJson.error).fieldErrors);
            setError(z.flattenError(fileJson.error).fieldErrors);
            return;
        }
        const ws = new WebSocket(`${BACKEND_WEBSOCKET}/websocket`);
        weRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            ws.send(file);
        }
        ws.onclose = () => setConnected(false);
        ws.onmessage = (e: MessageEvent<string>) => {
            const msg = JSON.parse(e.data) as ChatMessage;
            setMessages((prev) => [...prev, msg]);
            console.log(msg);
        };

        return () => ws.close();
    }, []);

    return (
        <div>WebSocket</div>
    )
}

export default WebSocketComponent