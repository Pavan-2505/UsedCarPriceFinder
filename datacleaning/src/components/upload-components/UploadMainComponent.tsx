"use client";
import React, { useState } from 'react'
import UploadCSVComponent from './UploadCSVComponent'
import UploadKaggleComponent from './UploadKaggleComponent'
import Shader from '../widespread-components/Shader';
import { LuLoaderCircle } from "react-icons/lu";
const UploadMainComponent = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    return (
        <>
            <Shader isOpen={isLoading} />
            <div className={`flex w-full h-full absolute justify-center items-center top-0 left-0 ${isLoading ? 'z-20 opacity-100' : '-z-2 opacity-0'}`} >
                <div className='flex gap-2 items-baseline text-primary-headings'>
                    <div>
                        <LuLoaderCircle className={`aspect-square  ${isLoading ? 'animate-spin' : ''} `} />
                    </div>
                    <h6>Setting Up Your Agents...</h6>
                </div>
            </div>
            <main className="w-140 mt-10">
                <UploadCSVComponent isLoading={isLoading} setIsLoading={(st: boolean) => setIsLoading(st)} />
                <div className="flex items-center gap-2 my-4">
                    <div className="w-full h-0.5 bg-border" />
                    <p className=" text-para">OR</p>
                    <div className="w-full h-0.5 bg-border" />
                </div>
                <UploadKaggleComponent isLoading={isLoading} setIsLoading={(st: boolean) => setIsLoading(st)} />
            </main>
        </>
    )
}

export default UploadMainComponent