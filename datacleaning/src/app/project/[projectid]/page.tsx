import WebSocketComponent from '@/components/websockets-components/WebSocketComponent';
import React, { Suspense } from 'react'

const page = async ({ params }: { params: Promise<{ projectid: string }> }) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResolveParamsComponent params={params} />
        </Suspense>
    );
    
}

const ResolveParamsComponent = async ({ params }: { params: Promise<{ projectid: string }> }) => {
    const {projectid} =  await params;
    console.log(projectid);
    return (

        <WebSocketComponent projectid={projectid} />
    )
}


export default page