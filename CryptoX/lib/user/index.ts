import {
  buildPrivateKey,
  getAddressFromPrivateKey,
  getUserFromChain,
  registerUserOnChain,
  decryptPrivateKey,
} from '../crypto'

export type User = {
  privateKey: string
  createdAt: string
  phoneNumer: string
  name: string
  address: string
}

export async function isUserRegistered(
  recipientPhone: string,
): Promise<boolean> {
  const user = await getUserFromChain(recipientPhone)
  return user !== null && user.exists
}

export async function getPrivateKeyByPhoneNumber(
  recipientPhone: string,
): Promise<string> {
  const user = await getUserFromChain(recipientPhone)
  if (!user || !user.exists) {
    throw new Error(`User not found for phone: ${recipientPhone}`)
  }
  return decryptPrivateKey(user.encryptedPrivateKey)
}

export async function getAddressByPhoneNumber(
  recipientPhone: string,
): Promise<string> {
  const user = await getUserFromChain(recipientPhone)
  if (!user || !user.exists) {
    throw new Error('User not found')
  }
  return user.walletAddress
}

export async function getUserFromPhoneNumber(
  recipientPhone: string,
): Promise<User | null> {
  const sanitizedPhone = recipientPhone.replace(/[^0-9.]/g, '')
  const user = await getUserFromChain(sanitizedPhone)
  if (!user || !user.exists) return null
  const privateKey = decryptPrivateKey(user.encryptedPrivateKey)
  return {
    createdAt: new Date().toISOString(),
    name: user.name,
    phoneNumer: sanitizedPhone,
    privateKey,
    address: user.walletAddress,
  }
}

export async function getUserFromId(userId: string): Promise<User> {
  // userId is the wallet address on-chain
  throw new Error(
    'getUserFromId is not supported in on-chain mode. Use getUserFromPhoneNumber instead.',
  )
}

export async function getAddressByUserId(userId: string): Promise<string> {
  throw new Error(
    'getAddressByUserId is not supported in on-chain mode. Use getAddressByPhoneNumber instead.',
  )
}

export async function createUser(
  recipientPhone: string,
  recipientName?: string,
): Promise<string> {
  const privateKey = buildPrivateKey()
  const userAddress = getAddressFromPrivateKey(privateKey)

  await registerUserOnChain(
    recipientPhone,
    recipientName || '',
    privateKey,
    userAddress,
  )

  return userAddress
}