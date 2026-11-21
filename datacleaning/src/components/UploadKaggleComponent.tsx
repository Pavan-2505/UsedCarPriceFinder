"use client";
import React from 'react'
import Form from "next/form";
const UploadKaggleComponent = () => {
    return (
        <Form action={() => {}}>
            <div className='font-Inter'>
                <h3 className='tracking-tight'>Kaggle Dataset Path</h3>
                <div className='flex gap-2'>
                    <input
                        id="KaggleLinkField"
                        className="border border-border rounded-xl w-full px-4 py-2 text-[15.74px]"
                        placeholder='Path Including the file name Eg:sujay1844/used-car-prices/train.csv'
                    />
                    <button type='submit' className='bg-buttons button-effects text-background w-fit px-4 rounded-xl py-2'>
                        <span>Submit</span>
                    </button>
                </div>
            </div>
        </Form>
    )
}

export default UploadKaggleComponent