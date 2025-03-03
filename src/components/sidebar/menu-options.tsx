'use client';
import { AgencySidebarOption, SubAccount, SubAccountSidebarOption } from '@prisma/client';
import React, { useEffect, useMemo } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ChevronsUpDown, Compass, Menu } from 'lucide-react';
import clsx from 'clsx';
import { AspectRatio } from '../ui/aspect-ratio';
import Image from 'next/image';
import { Popover, PopoverTrigger } from '../ui/popover';

interface IProps {
    defaultOpen?: boolean;
    subAccounts: SubAccount[];
    sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
    sideBarLogo: string;
    details: any;
    user: any;
    id: string;
}

export default function MenuOptions({ details, id, sideBarLogo, sidebarOpt, subAccounts, user, defaultOpen }: IProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const openState = useMemo(() => defaultOpen ? { open: true } : {}, [defaultOpen]);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) return;

    return (
        <Sheet modal={false} {...openState}>
            <SheetTrigger asChild className='absolute left-4 top-4 z-[100] md:!hidden flex'>
                <Button variant='outline' size='icon'>
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent
                showX={!defaultOpen}
                side='left'
                className={clsx('bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6',
                    { 'hidden md:inline-block z-0 w-[300px]': defaultOpen },
                    { 'inline-block md:hidden z-[100] w-full': !defaultOpen }
                )}
            >
                <div>
                    <AspectRatio ratio={16 / 5}>
                        <Image src={sideBarLogo} alt='sidebar logo' fill className='rounded-md object-contain' />
                    </AspectRatio>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className='w-full my-4 flex items-center justify-between py-8' variant='ghost'>
                                <div className='flex items-center text-left gap-2'>
                                    <Compass />
                                    <div className="flex flex-col">
                                        {details.name}
                                        <span className='text-xs text-muted-foreground'>{details.address}</span>
                                    </div>
                                </div>
                                <div>
                                    <ChevronsUpDown
                                        size={16}
                                        className='text-muted-foreground'
                                    />
                                </div>
                            </Button>
                        </PopoverTrigger>
                    </Popover>
                </div>
            </SheetContent>
        </Sheet>
    )
}
