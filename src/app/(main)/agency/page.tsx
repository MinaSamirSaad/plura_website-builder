import { getAuthUserDetails } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'

const Agency = async () => {
    const authUser = await currentUser();
    if (!authUser) return (redirect('/sign-in'));
    const user = await getAuthUserDetails();
    return (
        <div>Agency</div>
    )
}

export default Agency