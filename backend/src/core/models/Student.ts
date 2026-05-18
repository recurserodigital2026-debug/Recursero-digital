import { User, UserRole } from './User';

export class Student {
    id: string;
    name: string;
    lastname: string;
    dni: string;
    courseId: string | null;
    groupId: string | null;
    groupName: string | null;
    user: User;

    constructor(
        id: string,
        name: string,
        lastname: string,
        dni: string,
        courseId: string | null,
        user: User,
        groupId: string | null = null,
        groupName: string | null = null
    ) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.dni = dni;
        this.courseId = courseId;
        this.groupId = groupId;
        this.groupName = groupName;
        this.user = user;
    }

    getUsername(): string {
        return this.user.username;
    }

    getPasswordHash(): string {
        return this.user.passwordHash;
    }

    getRole(): UserRole {
        return this.user.role;
    }

    getCourseId(): string | null {
        return this.courseId;
    }

    getGroupId(): string | null {
        return this.groupId;
    }
}
