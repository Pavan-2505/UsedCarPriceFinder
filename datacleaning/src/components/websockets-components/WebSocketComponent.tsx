"use client";

import { BACKEND_WEBSOCKET } from "@/lib/constants";
import { generateRandomNumber } from "@/lib/idgen";
import Form from "next/form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import z from "zod";

interface ChatMessage {
    type: "progress" | "question" | "confirmation" | "table" | "table_question",
    progress?: string,
    prompt?: any,
    options?: {
        columns: string[];
        rows: string[];
        row_options: string[][]
    } | null | undefined | string[],
    data?: {
        columns: string[];
        rows: any[][];
    },
    time: Date,
    id: string,
    multivalue?: boolean
}

const AgentBackEndMessageSchema = z.object({
    time: z.string(),
    agent: z.number(),
    id: z.hex().length(32),
})

const ProgressSchema = z.object({
    type: z.literal("progress"),
    progress: z.string(),
}).extend(AgentBackEndMessageSchema.shape)

const QuestionSchema = z.object({
    type: z.enum(["question", "confirmation"]),
    prompt: z.string(),
    options: z.array(z.string()).optional().nullable(),
    multivalue: z.boolean().optional().nullable()
}).extend(AgentBackEndMessageSchema.shape)

const TableQuestionSchema = z.object({
    type: z.enum(["question", "confirmation"]),
    prompt: z.string(),
    options: z.object({ columns: z.array(z.string()), rows: z.array(z.string()), row_options: z.array(z.array(z.string())) }).optional().nullable()
}).extend(AgentBackEndMessageSchema.shape)

const TableSchema = z.object({
    type: z.literal("table"),
    data: z.object({
        columns: z.array(z.string()),
        rows: z.array(z.array(z.any())),
    }),
}).extend(AgentBackEndMessageSchema.shape)

type ProgressType = z.infer<typeof ProgressSchema>;
type QuestionsType = z.infer<typeof QuestionSchema>;
type TableType = z.infer<typeof TableSchema>;
type TableQuestionType = z.infer<typeof TableQuestionSchema>;

const AgentMessageSchema = z.object({
    type: z.enum(["progress", "question", "confirmation", "table"]),
    progress: z.string().optional(),
    prompt: z.any().optional(),
    data: z.object({
        columns: z.array(z.string()),
        rows: z.array(z.array(z.any())),
    }).optional(),
    time: z.date(),
    multivalue: z.boolean().optional(),
    options: z.union([z.object({ columns: z.array(z.string()), rows: z.array(z.string()), row_options: z.array(z.array(z.string())) }), z.array(z.string())]).optional().nullable(),
    id: z.hex().length(32),
})

type AgentMessageType = z.infer<typeof AgentMessageSchema>;

const ValidFileObject = z.object({
    file_id: z.hex().length(32),
    method: z.enum(["kaggle", "csv"]),
    original_name: z.string().refine((fname) => /^[A-Za-z0-9][A-Za-z0-9-/]+[A-Za-z0-9]\.csv$/.test(fname), 'Invalid File Name')
})

interface ErrorObject {
    metaError?: string[] | undefined,
    file_id?: string[] | undefined,
    original_name?: string[] | undefined,
}

const WebSocketComponent = ({ projectid }: { projectid: string }) => {
    const weRef = useRef<WebSocket | null>(null);
    const [filePath, setFilePath] = useState<string>('train.csv');
    const [message, setMessages] = useState<Record<number, ChatMessage[]>>({});
    const [requireResponseId, setRequiredResponseId] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);
    const [error, setError] = useState<ErrorObject>({ metaError: undefined, file_id: undefined, original_name: undefined });
    useEffect(() => {
        const file = localStorage.getItem('file-path');
        if (!file) {
            console.log("File Error: ", file);
            setError(prev => ({ ...prev, metaError: ['Something went wrong!'] }))
            return;
        }
        const fileJson = ValidFileObject.safeParse(JSON.parse(file));
        if (!fileJson.success) {
            console.log("Parse Error: ", file, z.flattenError(fileJson.error).fieldErrors);
            setError(z.flattenError(fileJson.error).fieldErrors);
            return;
        }
        setFilePath(fileJson.data.original_name);
        const ws = new WebSocket(`${BACKEND_WEBSOCKET}/websocket`);
        weRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            // ws.send(file);
            ws.send(JSON.stringify({ type: "start", run_id: generateRandomNumber(8), op: "main", params: fileJson.data }))
        }
        ws.onclose = () => setConnected(false);
        ws.onmessage = (e: MessageEvent<string>) => {
            const rawMsg = JSON.parse(e.data);
            console.log("Row MSg : ", rawMsg);
            let msg: ProgressType | QuestionsType | TableType | TableQuestionType;
            if (rawMsg.type === "done" || rawMsg.type === "error" || rawMsg.type === "cancelled") {
                console.log("raw", rawMsg);
                return;
            }
            if (rawMsg.type === "progress") {
                console.log("Progress", rawMsg);
                msg = ProgressSchema.parse(rawMsg);
            } else if (rawMsg.type === "table") {
                console.log("Table", rawMsg);
                msg = TableSchema.parse(rawMsg);
            } else if (rawMsg.type === "table_question") {
                console.log("Table Question", rawMsg);
                msg = TableQuestionSchema.parse(rawMsg);
            } else {
                console.log("Question", rawMsg);
                msg = QuestionSchema.parse(rawMsg);
            }
            const agent = msg.agent;
            const date = new Date(msg.time);
            setMessages((prev) => ({ ...prev, [agent]: [...(prev?.[agent] ?? []), AgentMessageSchema.parse({ ...msg, time: date })] }));
            setRequiredResponseId(msg.id);
            console.log(msg);
        };


        return () => ws.close();
    }, []);

    const submitQuestion = (id: string, orgMsg: { rows: string[], columns: string[], row_options: string[][] }, formData: FormData) => {
        const rowPos = Object.fromEntries(orgMsg.rows.map((ele, eleIndex) => [eleIndex, ele.replaceAll(" ", "_")]))
        const colPos = Object.fromEntries(orgMsg.columns.slice(1).map((ele, eleIndex) => [eleIndex, ele.replaceAll(" ", "_")]))
        const res: Record<string, Record<string, string>> = {};
        formData.forEach((val, key) => {
            const [rowIndex, colIndex] = key.split(' ');
            res[rowPos[rowIndex]] = { ...res[rowPos[rowIndex]], [colPos[colIndex]]: val as string };
        })
        weRef.current?.send(JSON.stringify({ id, type: "answer", value: res }));
    }

    return (
        <div className="font-Inter">
            <aside className="flex bg-primary-headings text-background px-4 py-2 items-center gap-2">
                <Link href={'/'}>
                    <h5 className="hover:bg-mutedheadings/50 tracking-tight px-2 py-1 cursor rounded-md" >Data Cleaner</h5>
                </Link>
                <p>/</p>
                <h5 className="" >{filePath}</h5>
            </aside>
            <main className="w-full h-full flex justify-center">
                <div className="w-3/5">
                    <div className="w-full h-full mt-6 mb-20">
                        {Object.entries(message).map(agentMessages => {
                            console.log("Messages", agentMessages);
                            return (
                                <div className="flex gap-2 mb-4" key={agentMessages[0]}>
                                    <div className="w-20">
                                        <h6 className="whitespace-pre bg-background2 h-fit rounded-xl px-2 py-2 font-semibold ">Agent {agentMessages[0]}</h6>
                                    </div>
                                    <div className="bg-background2 rounded-xl px-2 py-2 w-[calc(100%-100px)]">
                                        {agentMessages[1].map(msg => {
                                            if (msg.type === "progress") {
                                                return (<div className="mb-1 " key={msg.id}>{msg.progress}</div>)
                                            } if (msg.type === "question") {

                                            }
                                            if (msg.type === "table_question") {
                                                const tableOption = msg.options as {
                                                    columns: string[];
                                                    rows: string[];
                                                    row_options: string[][]
                                                }
                                                return (
                                                    <Form key={msg.id} action={(f) => submitQuestion(msg.id, tableOption, f)}>
                                                        <div className="w-full overflow-x-auto">
                                                            <p>Question</p>
                                                            <table key={msg.id}>
                                                                <thead>
                                                                    <tr>
                                                                        {tableOption.columns.map(col => (
                                                                            <th className="border border-border" key={col}>{col}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {
                                                                        tableOption.rows.map((row, rowIndex) => (
                                                                            <tr key={rowIndex}>
                                                                                <td key={`${rowIndex} main title`}>{row}</td>
                                                                                {
                                                                                    [...Array(tableOption.columns.length - 1)].map((_, eleIndex) => (
                                                                                        <td key={`${rowIndex} ${eleIndex}`}>
                                                                                            <select name={`${rowIndex} ${eleIndex}`}>
                                                                                                {tableOption.row_options[eleIndex].map(ele => (
                                                                                                    <option key={ele} value={ele}>{ele}</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </td>
                                                                                    ))
                                                                                }
                                                                            </tr>
                                                                        ))
                                                                    }
                                                                </tbody>
                                                            </table>
                                                            <button className="button-effects">Submit</button>
                                                        </div>
                                                    </Form>
                                                )
                                            }
                                            if (msg.type === "confirmation") {
                                                return (
                                                    <div key={msg.id}>
                                                        <p>{msg.prompt}</p>
                                                        <div onClick={() => {
                                                            if (msg.id !== requireResponseId) { return; }
                                                            weRef.current?.send(JSON.stringify({ id: msg.id, type: "answer", value: "yes" }))
                                                        }} className="button-effects" >Yes</div>
                                                        <div onClick={() => {
                                                            if (msg.id !== requireResponseId) { return; }
                                                            weRef.current?.send(JSON.stringify({ id: msg.id, type: "answer", value: "no" }))
                                                        }} className="button-effects" >No</div>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div key={msg.id} className="w-full overflow-x-auto">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                {msg.data?.columns.map(col => (
                                                                    <th className="border border-border" key={col}>{col}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                msg.data?.rows.map((row, rowIndex) => (
                                                                    <tr key={rowIndex}>{
                                                                        row.map((ele, eleIndex) => (
                                                                            <td key={`${rowIndex} ${ele} ${eleIndex}`}>{ele}</td>
                                                                        ))
                                                                    }</tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="w-full left-0 fixed bottom-0 flex justify-center px-2 pb-2 bg-background">
                        <textarea
                            placeholder="Enter your next answer"
                            className={`border-2 w-3/5 h-20 resize-none min-h-20 field-sizing-content rounded-xl px-4 py-2 text-[15.74px] border-para `}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default WebSocketComponent