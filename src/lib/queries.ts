"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Plan, Role, SubAccount, User } from "@prisma/client";
import { v4 } from "uuid";
import { createMediaType } from "./types";

export async function getAuthUserDetails() {
    const user = await currentUser();
    if (!user) {
        return;
    }
    const userData = await db.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
        include: {
            Agency: {
                include: {
                    SidebarOption: true,
                    SubAccount: {
                        include: {
                            SidebarOption: true,
                        }
                    }
                }
            },
            Permissions: true,
        }
    })
    return userData;
}

export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId,
}: {
    agencyId?: string
    description: string
    subaccountId?: string
}) => {
    const authUser = await currentUser()
    let userData
    if (!authUser) {
        const response = await db.user.findFirst({
            where: {
                Agency: {
                    SubAccount: {
                        some: { id: subaccountId },
                    },
                },
            },
        })
        if (response) {
            userData = response
        }
    } else {
        userData = await db.user.findUnique({
            where: { email: authUser?.emailAddresses[0].emailAddress },
        })
    }

    if (!userData) {
        console.log('Could not find a user')
        return
    }

    let foundAgencyId = agencyId
    if (!foundAgencyId) {
        if (!subaccountId) {
            throw new Error(
                'You need to provide at least an agency Id or sub account Id'
            )
        }
        const response = await db.subAccount.findUnique({
            where: { id: subaccountId },
        })
        if (response) foundAgencyId = response.agencyId
    }
    if (subaccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
                SubAccount: {
                    connect: { id: subaccountId },
                },
            },
        })
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId,
                    },
                },
            },
        })
    }
}

export const createTeamUser = async (_agencyId: string, user: User) => {
    if (user.role === 'AGENCY_OWNER') return null;
    const response = db.user.create({ data: { ...user } });
    return response;
}

export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser();
    if (!user) return redirect('/sign-in');

    const invitationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: "PENDING"
        }
    })

    if (invitationExists) {
        const userData = {
            email: invitationExists.email,
            role: invitationExists.role,
            agencyId: invitationExists.agencyId,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatarUrl: user.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const userDetails = await createTeamUser(invitationExists.agencyId, userData);
        await saveActivityLogsNotification({
            description: 'joined',
            agencyId: invitationExists?.agencyId,
            subaccountId: undefined
        })
        if (userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || 'SUBACCOUNT_USER',
                }
            })
            await db.invitation.delete({
                where: {
                    email: userDetails.email,
                },
            })
            return userDetails.agencyId;
        }
        else return null;

    }
    else {
        const agency = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress
            },
        })
        return agency ? agency.agencyId : null;
    }



}

export const updateAgencyDetails = async (agencyId: string, data: Partial<Agency>) => {
    const response = await db.agency.update({
        where: { id: agencyId },
        data: { ...data }
    })
    return response;
}

export const deleteAgency = async (agencyId: string) => {
    const response = await db.agency.delete({ where: { id: agencyId } })
    return response
}

export const initUser = async (newUser: Partial<User>) => {
    const user = await currentUser()
    if (!user) return

    const userData = await db.user.upsert({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        update: newUser,
        create: {
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: newUser.role || 'SUBACCOUNT_USER',
        },
    })

    await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || 'SUBACCOUNT_USER',
        },
    })

    return userData
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const upsertAgency = async (agency: Agency, _price?: Plan) => {
    if (!agency.companyEmail) return null
    try {
        const agencyDetails = await db.agency.upsert({
            where: {
                id: agency.id,
            },
            update: agency,
            create: {
                users: {
                    connect: { email: agency.companyEmail },
                },
                ...agency,
                SidebarOption: {
                    create: [
                        {
                            name: 'Dashboard',
                            icon: 'category',
                            link: `/agency/${agency.id}`,
                        },
                        {
                            name: 'Launchpad',
                            icon: 'clipboardIcon',
                            link: `/agency/${agency.id}/launchpad`,
                        },
                        {
                            name: 'Billing',
                            icon: 'payment',
                            link: `/agency/${agency.id}/billing`,
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            link: `/agency/${agency.id}/settings`,
                        },
                        {
                            name: 'Sub Accounts',
                            icon: 'person',
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                            name: 'Team',
                            icon: 'shield',
                            link: `/agency/${agency.id}/team`,
                        },
                    ],
                },
            },
        })
        return agencyDetails
    } catch (error) {
        console.log(error)
    }
}

export const getNotificationAndUser = async (agencyId: string) => {
    try {
        const response = await db.notification.findMany({
            where: { agencyId },
            include: { User: true },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

export const upsertSubAccount = async (subAccount: SubAccount) => {
    if (!subAccount.companyEmail) return null;
    const agencyOwner = await db.user.findFirst({ where: { Agency: { id: subAccount.agencyId }, role: 'AGENCY_OWNER' } });
    if (!agencyOwner) return null;
    const permissionId = v4();
    const response = await db.subAccount.upsert({
        where: { id: subAccount.id },
        update: subAccount,
        create: {
            ...subAccount,
            Permissions: {
                create: { id: permissionId, access: true, email: agencyOwner.email },
                connect: { subAccountId: subAccount.id, id: permissionId },
            },
            Pipeline: {
                create: [{ name: 'lead cycle' }]
            },
            SidebarOption: {
                create: [{
                    name: "Launchpad",
                    icon: "clipboardIcon",
                    link: `/subaccount/${subAccount.id}/launchpad`
                },
                {
                    name: "Settings",
                    icon: "settings",
                    link: `/subaccount/${subAccount.id}/settings`
                },
                {
                    name: "Funnels",
                    icon: "pipelines",
                    link: `/subaccount/${subAccount.id}/funnels`
                },
                {
                    name: "Media",
                    icon: "database",
                    link: `/subaccount/${subAccount.id}/media`
                },
                {
                    name: "Automations",
                    icon: "chip",
                    link: `/subaccount/${subAccount.id}/automations`
                },
                {
                    name: "Pipelines",
                    icon: "flag",
                    link: `/subaccount/${subAccount.id}/pipelines`
                },
                {
                    name: "Contacts",
                    icon: "person",
                    link: `/subaccount/${subAccount.id}/contacts`
                },
                {
                    name: "Dashboard",
                    icon: "category",
                    link: `/subaccount/${subAccount.id}`,
                }
                ]
            }
        },
    })
    return response
}

export const getUserPermissions = async (userId: string) => {
    const response = await db.user.findUnique({
        where: { id: userId },
        select: { Permissions: { include: { SubAccount: true } } },
    })
    return response
}

export const updateUser = async (user: Partial<User>) => {
    const response = await db.user.update({
        where: { email: user.email },
        data: { ...user }
    })
    await clerkClient.users.updateUserMetadata(response.id, {
        privateMetadata: {
            role: user.role || 'SUBACCOUNT_USER',
        }
    })
    return response;
}

export const changeUserPermissions = async (permissionId: string | undefined, userEmail: string, subAccountId: string, permission: boolean) => {
    try {
        const response = await db.permissions.upsert({
            where: { id: permissionId },
            update: { access: permission },
            create: {
                id: permissionId,
                email: userEmail,
                access: permission,
                subAccountId,
            }
        })
        return response;
    } catch (error) {
        console.log('Error in changing user permissions', error);
    }
}

export const getSubaccountDetails = async (subaccountId: string) => {
    const response = await db.subAccount.findUnique({
        where: {
            id: subaccountId,
        },
    })
    return response
}

export const deleteSubAccount = async (subaccountId: string) => {
    const response = await db.subAccount.delete({
        where: {
            id: subaccountId,
        },
    })
    return response
}

export const deleteUser = async (userId: string) => {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
            role: undefined,
        },
    })
    const deletedUser = await db.user.delete({ where: { id: userId } })

    return deletedUser
}

export const getUser = async (id: string) => {
    const user = await db.user.findUnique({
        where: {
            id,
        },
    })

    return user
}

export const sendInvitation = async (
    role: Role,
    email: string,
    agencyId: string
) => {
    const resposne = await db.invitation.create({
        data: { email, agencyId, role },
    })

    try {
        const invitation = await clerkClient.invitations.createInvitation({
            emailAddress: email,
            redirectUrl: process.env.NEXT_PUBLIC_URL,
            publicMetadata: {
                throughInvitation: true,
                role,
            },
        })
    } catch (error) {
        console.log(error)
        throw error
    }

    return resposne;
}
export const getMedia = async (subaccountId: string) => {
    const mediafiles = await db.subAccount.findUnique({
        where: {
            id: subaccountId,
        },
        include: { Media: true },
    })
    return mediafiles
}

export const deleteMedia = async (mediaId: string) => {
    const response = await db.media.delete({
        where: {
            id: mediaId
        }
    })
    return response
}

export const createMedia = async (
    subaccountId: string,
    mediaFile: createMediaType
) => {
    const response = await db.media.create({
        data: {
            link: mediaFile.link,
            name: mediaFile.name,
            subAccountId: subaccountId,
        }
    })
    return response
}