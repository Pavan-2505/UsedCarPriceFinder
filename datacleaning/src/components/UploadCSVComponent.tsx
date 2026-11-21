'use client';

import { BACKEND_API_ROUTE } from "@/lib/constants";
import { ChangeEvent, useState } from "react";
import { FiUpload } from "react-icons/fi";

const UploadCSVComponent = () => {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const onFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".csv")) {
            e.target.value = "";
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            console.log("API",BACKEND_API_ROUTE);
            const res = await fetch(`${BACKEND_API_ROUTE}/uploads/csv`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.log("Error : ", body.details ?? "Upload Error Failed");
                return;
            }
            console.log("Success");

        } catch (e) {

        }
        setIsLoading(false);
    }
    return (
        <>
            <label htmlFor="uploadImage" className='cursor-pointer'>
                <h3 className='tracking-tight'>Upload CSV File</h3>
                <div className='bg-background2 flex flex-col items-center justify-center h-24 rounded-lg'>
                    <FiUpload className='text-[25.4px]' />
                    <div className='mt-2'>
                        <p className='text-mutedheadings '>Max 1GB</p>
                    </div>
                </div>
            </label>
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