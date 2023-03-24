// import {User} from '../../user/user.model'
//
// const createdUser = await User.create({name, phone, email, password: hashed_password, role: 'user'})

export const userPostBody: any = {
    "name": "test_user",
    "password": "password",
    "phone": "+380987654321",
    "email": "test_user@example.com"
}

export const userPatchPhone = {
    "phone": "+380987654371"
}

export const incorrectUserPostBody = {
    "name": "test_user",
    "password": "password",
    "phone": "+380987654321"
}

export const adminUser = {
    "name": "test_admin",
    "password": "password",
    "phone": "+380087654321",
    "email": "test_admin@example.com",
    "role": "admin"
}

export const testUser: any = {
    "name": "test_user",
    "password": "password",
    "phone": "+380987654321",
    "email": "test_user@example.com"
}