'use client';

import { BACKEND_API_ROUTE } from "@/lib/constants";
import { ChangeEvent, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useRouter } from "next/navigation";
import ErrorMessageDiv from "../widespread-components/ErrorMessageDiv";

const UploadCSVComponent = ({ isLoading, setIsLoading }: { isLoading: boolean, setIsLoading: (state: boolean) => void }) => {
    const [error, setError] = useState<string>('');

    const router = useRouter();
    const onFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".csv")) {
            e.target.value = "";
            setError("Only .csv files allowed");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(`/api/uploads/csv`, {
                method: "POST",
                body: formData
            });

            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(body.details ?? "Upload Failed");
                return;
            }
            // console.log(body);
            localStorage.setItem("file-path", JSON.stringify(body));
            router.push(`project/${body.file_id}`);
            setError('');

        } catch (e) {
            setError("Upload Failed");
        }
        setTimeout(() => { setIsLoading(false); }, 1000)

    }
    return (
        <>
            <label htmlFor="uploadImage" className='cursor-pointer'>
                <h3 className='tracking-tight'>Upload CSV File</h3>
                <div className='bg-background2 flex flex-col items-center justify-center h-24 rounded-lg'>
                    <FiUpload className='text-[25.4px]' />
                    <div className='mt-2'>
                        <p className='text-mutedheadings '>.csv files</p>
                    </div>
                </div>
            </label>
            {error && <ErrorMessageDiv message={error} textSize={16} />}
            <input
                type='file'
                id="uploadImage"
                className='hidden'
                multiple={false}
                onChange={onFileUpload}
                accept=".csv,text/csv"
            />

        </>
    )
}

export default UploadCSVComponent