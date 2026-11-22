"use client";
import React, { useState } from 'react'
import Form from "next/form";
import { useRouter } from "next/navigation";
import { BACKEND_API_ROUTE } from '@/lib/constants';
import { z } from 'zod';
import ErrorMessageDiv from '../widespread-components/ErrorMessageDiv';
const UploadKaggleComponent = ({ isLoading, setIsLoading }: { isLoading: boolean, setIsLoading: (state: boolean) => void }) => {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [validPath, setValidPath] = useState<boolean | null>(null);
    const onPathUpload = async (formData: FormData) => {
        setIsLoading(true);
        console.log("Path Loading...");
        try {
            console.log("form ele",formData.get("path"));
            const filepath: string | null = z.string().parse(formData.get("path"));
            if (!filepath.endsWith(".csv")) {
                console.log("Invalid .csv");
                setError("The file path must end with filename and .csv");
                setValidPath(false);
                setIsLoading(false);
                return;
            }
            if (!/^[A-Za-z0-9][A-Za-z0-9-/]+[A-Za-z0-9]\.csv$/.test(filepath)) {
                console.log("Invalid regex");
                setError("The file path with filename is not valid");
                setValidPath(false);
                setIsLoading(false);
                return;
            }
            const res = await fetch(`/api/uploads/kaggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path : filepath })
            });
            
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.log("Body : ",body);
                setError(body.details ?? "Something went wrong! Try again later...");
                setIsLoading(false);
                return;
            }
            // console.log(body);
            setError('');
            
            localStorage.setItem("file-path", JSON.stringify(body));
            router.push(`project/${body.file_id}`);
            
        } catch (e) {
            console.log("Path Loading...Error",e);
            setError("Something went wrong! Try again later...");
        }
        setTimeout(() => { setIsLoading(false); }, 1000)

    }
    return (
        <Form action={onPathUpload}>
            <div className='font-Inter'>
                <h3 className='tracking-tight'>Kaggle Dataset Path</h3>
                <div className='flex gap-2'>
                    <input
                        id="path"
                        name="path"
                        className={`border rounded-xl w-full px-4 py-2 text-[15.74px] ${error ? 'outline-red-500 border-red-500' : 'border-border'} ${validPath ? 'border-green-400' : ''} `}
                        placeholder='Path Including the file name Eg:sujay1844/used-car-prices/train.csv'
                        onChange={(e) => {
                            if (!e.target.value.endsWith(".csv")) {
                                setError("The file path must end with filename and .csv");
                                setValidPath(false);
                                return;
                            }
                            if (!/^[A-Za-z0-9][A-Za-z0-9-/]+[A-Za-z0-9]\.csv$/.test(e.target.value)) {
                                setError("The file path with filename is not valid");
                                setValidPath(false);
                                return;
                            }
                            setError("");
                            setValidPath(true);
                        }}
                    />
                    <button type='submit' className='bg-buttons button-effects text-background w-fit px-4 rounded-xl py-2'>
                        <span>Load</span>
                    </button>
                </div>
                {error && <ErrorMessageDiv message={error} textSize={16} />}
                {validPath && <ErrorMessageDiv message={'Valid Path'} color='#05df72' textSize={16} />}
            </div>
        </Form>
    )
}

export default UploadKaggleComponent