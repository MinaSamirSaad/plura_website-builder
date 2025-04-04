'use client';
import { AgencySidebarOption, SubAccount, SubAccountSidebarOption } from '@prisma/client';
import React, { useEffect, useMemo } from 'react'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from 'lucide-react';
import clsx from 'clsx';
import { AspectRatio } from '../ui/aspect-ratio';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import Link from 'next/link';
import { useModal } from '@/providers/modal-provider';
import CustomModal from '../global/custom-modal';
import SubAccountDetails from '../forms/subaccount-details';
import { Separator } from '../ui/separator';
import { icons } from '@/lib/constants';
import MenuLink from '../menu-options-link';

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
    const { setOpen } = useModal();
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
                    { 'hidden md:inline-block z-[50] w-[350px]': defaultOpen },
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
                        <PopoverContent className='w-80 h-80 mt-4 z[200]'>
                            {
                                <Command className='rounded-lg'>
                                    <CommandInput placeholder='Search Account...' />
                                    <CommandList className='pb-16'>
                                        <CommandEmpty>No Results found</CommandEmpty>
                                        {
                                            (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN')
                                            &&
                                            user?.Agency
                                            &&
                                            <CommandGroup heading='Agency'>
                                                <CommandItem
                                                    className='!bg-transparent my-2 text-primary border-[1px]
                                                                border-border p-2 rounded-md hover:bg-muted
                                                                cursor-pointer transition-all'
                                                >
                                                    {defaultOpen ?
                                                        <Link
                                                            href={`/agency/${user?.Agency?.id}`}
                                                            className='flex gap-4 w-full h-full'
                                                        >
                                                            <div className='relative w-16'>
                                                                <Image src={user?.Agency?.agencyLogo} alt='Agency logo' fill className='rounded-md object-contain' />
                                                            </div>
                                                            <div className='flex flex-col flex-1'>
                                                                {user?.Agency?.name}
                                                                <span className='text-muted-foreground'>{user?.Agency?.address}</span>
                                                            </div>
                                                        </Link>
                                                        :
                                                        <SheetClose asChild>
                                                            <Link
                                                                href={`/agency/${user?.Agency?.id}`}
                                                                className='flex gap-4 w-full h-full'
                                                            >
                                                                <div className='relative w-16'>
                                                                    <Image src={user?.Agency?.agencyLogo} alt='Agency logo' fill className='rounded-md object-contain' />
                                                                </div>
                                                                <div className='flex flex-col flex-1'>
                                                                    {user?.Agency?.name}
                                                                    <span className='text-muted-foreground'>{user?.Agency?.address}</span>
                                                                </div>
                                                            </Link>
                                                        </SheetClose>
                                                    }
                                                </CommandItem>
                                            </CommandGroup>
                                        }
                                        <CommandGroup heading='Accounts'>
                                            {
                                                (!!subAccounts) ?
                                                    subAccounts.map(
                                                        (subAccount) => (<CommandItem key={subAccount.id}>
                                                            {defaultOpen ?
                                                                <Link
                                                                    href={`/subaccount/${subAccount?.id}`}
                                                                    className='flex gap-4 w-full h-full'
                                                                >
                                                                    <div className='relative w-16'>
                                                                        <Image src={subAccount?.subAccountLogo} alt='SubAccount logo' fill className='rounded-md object-contain' />
                                                                    </div>
                                                                    <div className='flex flex-col flex-1'>
                                                                        {subAccount?.name}
                                                                        <span className='text-muted-foreground'>{subAccount?.address}</span>
                                                                    </div>
                                                                </Link>
                                                                :
                                                                <SheetClose asChild>
                                                                    <Link
                                                                        href={`/subaccount/${subAccount?.id}`}
                                                                        className='flex gap-4 w-full h-full'
                                                                    >
                                                                        <div className='relative w-16'>
                                                                            <Image src={subAccount?.subAccountLogo} alt='SubAccount logo' fill className='rounded-md object-contain' />
                                                                        </div>
                                                                        <div className='flex flex-col flex-1'>
                                                                            {subAccount?.name}
                                                                            <span className='text-muted-foreground'>{subAccount?.address}</span>
                                                                        </div>
                                                                    </Link>
                                                                </SheetClose>
                                                            }
                                                        </CommandItem>)
                                                    )
                                                    :
                                                    'No Accounts Found'
                                            }
                                        </CommandGroup>
                                    </CommandList>
                                    {
                                        (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN')
                                        &&
                                        (
                                            <SheetClose>
                                                <Button
                                                    className='w-full flex gap-2'
                                                    onClick={
                                                        () => setOpen(
                                                            <CustomModal
                                                                title='Create A Sub Account'
                                                                subheading='you can switch between your agency account and the sub account from the sidebar'
                                                            >
                                                                <SubAccountDetails
                                                                    agencyDetails={user?.Agency}
                                                                    userId={user?.id}
                                                                    userName={user?.name}

                                                                />
                                                            </CustomModal>
                                                        )
                                                    }
                                                >
                                                    <PlusCircleIcon size={15} />
                                                    Create Sub Account
                                                </Button>
                                            </SheetClose>
                                        )
                                    }
                                </Command>
                            }
                        </PopoverContent>
                    </Popover>
                    <p className='text-muted-foreground text-xs mb-2'>MENU LINKS</p>
                    <Separator className='mb-4' />
                    <nav className='relative'>
                        <Command className='rounded-lg overflow-visible bg-transparent'>
                            <CommandInput placeholder='Search...' />
                            <CommandList className='py-4 overflow-visible '>
                                <CommandEmpty>
                                    No Results found
                                </CommandEmpty>
                                <CommandGroup heading='Menu' className='overflow-visible'>
                                    {
                                        sidebarOpt.map(
                                            (opt) => {
                                                let val;
                                                const result = icons.find((icon) => icon.value === opt.icon);
                                                if (result) {
                                                    val = <result.path />;
                                                }
                                                return (<MenuLink opt={opt} val={val} key={opt.id} />);
                                            }
                                        )
                                    }
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    )
}
