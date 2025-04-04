import { Notification, Prisma, Role } from "@prisma/client";
import { getAuthUserDetails, getMedia, getUserPermissions } from "./queries";
import { db } from "./db";

export type NotificationWithUser =
    | ({
        User: {
            id: string
            name: string
            avatarUrl: string
            email: string
            createdAt: Date
            updatedAt: Date
            role: Role
            agencyId: string | null
        }
    } & Notification)[]
    | undefined

export type UserWithPermissionsAndSubAccount = Prisma.PromiseReturnType<typeof getUserPermissions>
export type AuthUserWithAgencySidebarOptionsSubAccounts = Prisma.PromiseReturnType<typeof getAuthUserDetails>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
    agencyId: string
) => {
    return await db.user.findFirst({
        where: { Agency: { id: agencyId } },
        include: {
            Agency: { include: { SubAccount: true } },
            Permissions: { include: { SubAccount: true } },
        },
    })
}

export type UsersWithAgencySubAccountPermissionsSidebarOptions =
    Prisma.PromiseReturnType<
        typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
    >

export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>

export type createMediaType = Prisma.MediaCreateWithoutSubaccountInput
