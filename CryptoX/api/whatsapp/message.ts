import type { VercelApiHandler, VercelResponse } from '@vercel/node'

import {
  Whatsapp,
  sendMessageToPhoneNumber,
  sendSimpleButtonsMessage,
} from '../../lib/whatsapp'

import {
  WhatsappNewMessageEventNotificationRequest,
  WhatsappParsedMessage,
} from './types'

import {
  getAddressByPhoneNumber,
  getPrivateKeyByPhoneNumber,
  getUserFromPhoneNumber,
} from '../../lib/user'

import { createUser } from '../../lib/user'

import { getAccountBalances } from 'lib/crypto'
import {
  Address,
  PhoneNumber,
  addReceiverToPayment,
  cancelPaymentRequest,
  confirmPaymentRequest,
  getHelaScanUrlForAddress,
  getReceiverUserFromUncompletedPaymentRequest,
  getRecipientAddressFromUncompletedPaymentRequest,
  isReceiverInputPending,
  isUserAwaitingAmountInput,
  makePaymentRequest,
  sendHlusdFromWallet,
  updatePaymentRequestToError,
} from '../../lib/crypto/transaction'
import { transformStringToNumber } from '../../lib/utils/number'

async function sendMenuButtonsTo(phoneNumber: string) {
  await sendSimpleButtonsMessage(phoneNumber, 'What would you like to do?', [
    { title: 'Deposit funds', id: 'check_address' },
    { title: 'Send money 💸', id: 'send_money' },
    { title: 'Check balance 🔎', id: 'check_balance' },
  ])
}

const handler: VercelApiHandler = async (
  req: WhatsappNewMessageEventNotificationRequest,
  res: VercelResponse,
) => {
  console.log('POST /api/whatsapp/message received')

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  try {
    console.log('Parsing message body:', JSON.stringify(req.body, null, 2))
    const data: WhatsappParsedMessage = Whatsapp.parseMessage(req.body)
    console.log('Parsed message:', JSON.stringify(data, null, 2))

    if (data?.isMessage) {
      const {
        message: {
          from: { phone: recipientPhone, name: recipientName },
          type: typeOfMessage,
          message_id: messageId,
          text,
        },
      } = data

      console.log(`Message from ${recipientPhone} (${recipientName}): type=${typeOfMessage}`)

      const sendMenuButtons = async () => {
        sendMenuButtonsTo(recipientPhone)
      }

      const isBrazilNumber = recipientPhone.startsWith('55')
      if (isBrazilNumber) {
        if (process.env.ADMIN_PHONE_NUMBER && process.env.BRAZIL_MESSAGE) {
          await sendMessageToPhoneNumber(recipientPhone, process.env.BRAZIL_MESSAGE)
          await sendMessageToPhoneNumber(
            process.env.ADMIN_PHONE_NUMBER,
            `${recipientPhone} - ${recipientName} has tried to use bot`,
          )
        }
        return
      }

      try {
        if (typeOfMessage === 'text_message') {
          console.log('Handling text_message...')
          const user = await getUserFromPhoneNumber(recipientPhone)
          console.log('User found:', user)

          if (user) {
            // Use address as userId since we no longer have a DB id
            const userId = user.address

            if (text && (await isReceiverInputPending(userId))) {
              const receiver: PhoneNumber | Address = text.body
              try {
                const validatedReceiver = await addReceiverToPayment({ userId, receiver })
                await sendSimpleButtonsMessage(
                  recipientPhone,
                  `How many HLUSD would you like to send to ${validatedReceiver}?`,
                  [{ title: 'Cancel transaction', id: 'cancel_send_money' }],
                )
                return
              } catch (error) {
                await sendSimpleButtonsMessage(
                  recipientPhone,
                  `The value is not valid. Make sure it matches a wallet address format or that the phone number has a CryptoX account.\n ${error}`,
                  [{ title: 'Cancel transaction', id: 'cancel_send_money' }],
                )
              }
              return
            }

            if (text && (await isUserAwaitingAmountInput(userId))) {
              let amount: number
              try {
                amount = transformStringToNumber(text.body)
              } catch (error) {
                await sendSimpleButtonsMessage(
                  recipientPhone,
                  `Invalid format 🤕. Please enter a whole or decimal number!`,
                  [{ title: 'Cancel transaction', id: 'cancel_send_money' }],
                )
                return
              }

              try {
                const receiverUser = await getReceiverUserFromUncompletedPaymentRequest(userId)
                const senderPrivateKey = await getPrivateKeyByPhoneNumber(recipientPhone)
                const fromAddress = await getAddressByPhoneNumber(recipientPhone)

                await sendHlusdFromWallet({
                  tokenAmount: amount,
                  privateKey: senderPrivateKey,
                  fromAddress,
                  toAddress: await getRecipientAddressFromUncompletedPaymentRequest(userId),
                })

                await confirmPaymentRequest({ userId, amount })

                await sendMessageToPhoneNumber(recipientPhone, 'Payment successful! 🎉 For more details: 👇👇👇')

                if (receiverUser) {
                  await sendMessageToPhoneNumber(
                    receiverUser.phoneNumer,
                    `You received ${amount} HLUSD from ${user.name} 🌟`,
                  )
                  await sendMenuButtonsTo(receiverUser.phoneNumer)
                }

                const helaScanUrl = getHelaScanUrlForAddress(fromAddress)
                await sendMessageToPhoneNumber(recipientPhone, helaScanUrl)
              } catch (error) {
                await updatePaymentRequestToError(userId)
                await sendMessageToPhoneNumber(recipientPhone, `Payment could not be completed 😢`)
                await sendMessageToPhoneNumber(recipientPhone, `We encountered an error: ${error}`)
              }
              return
            }

            await sendMessageToPhoneNumber(
              recipientPhone,
              `Welcome back${recipientName ? ` ${recipientName}` : ''}! 👋`,
            )
            await sendMenuButtons()
          } else {
            console.log('New user! Sending welcome message...')
            await sendMessageToPhoneNumber(
              recipientPhone,
              `Hi ${recipientName}! 👋 Welcome to *CryptoX*\n_Built by Parth Verma & Raghav Arora_`,
            )
            await sendMessageToPhoneNumber(
              recipientPhone,
              `CryptoX is a WhatsApp-native crypto wallet powered by *Hela Chain* ⛓️\n\n✅ Instant payments\n✅ Send & receive HLUSD\n✅ Non-custodial wallet\n✅ No app needed — just WhatsApp!`,
            )
            await sendMessageToPhoneNumber(
              recipientPhone,
              `Create your *Hela Chain* wallet in seconds and start sending money instantly 🚀`,
            )
            await sendSimpleButtonsMessage(
              recipientPhone,
              "It looks like you don't have a wallet linked to this number. Would you like to create one?",
              [{ title: 'Create a wallet', id: 'create_wallet' }],
            )
          }
        }

        if (typeOfMessage === 'simple_button_message') {
          console.log('Handling button message...')
          const button_id = data.message.button_reply.id
          console.log('Button ID:', button_id)

          const user = await getUserFromPhoneNumber(recipientPhone)

          switch (button_id) {
            case 'send_money': {
              if (!user) throw new Error('Unexpectedly could not find the user')

              await makePaymentRequest({
                amount: null,
                fromUserId: user.address,
                to: null,
              })

              await sendMessageToPhoneNumber(recipientPhone, `Who would you like to send money to?`)
              await sendSimpleButtonsMessage(
                recipientPhone,
                `Enter the recipient's phone number or wallet address`,
                [{ title: 'Cancel', id: 'cancel_send_money' }],
              )
              break
            }
            case 'check_balance': {
              await sendMessageToPhoneNumber(recipientPhone, 'Loading ⏳')
              const privateKey = await getPrivateKeyByPhoneNumber(recipientPhone)
              const { hlusdBalance } = await getAccountBalances(privateKey)
              await sendMessageToPhoneNumber(recipientPhone, `${hlusdBalance} HLUSD`)
              await sendMenuButtons()
              break
            }
            case 'check_address': {
              await sendMessageToPhoneNumber(recipientPhone, 'Loading ⏳')
              const address = await getAddressByPhoneNumber(recipientPhone)
              await sendMessageToPhoneNumber(recipientPhone, 'To deposit funds, you need to send them to this address:')
              await sendMessageToPhoneNumber(recipientPhone, address)
              await sendMessageToPhoneNumber(recipientPhone, '(Send HLUSD via the Hela Chain network)')
              await sendMenuButtons()
              break
            }
            case 'create_wallet': {
              await sendMessageToPhoneNumber(recipientPhone, 'Creating your wallet! 🔨')
              const walletAddress = await createUser(recipientPhone, recipientName)
              await sendMessageToPhoneNumber(
                recipientPhone,
                'Your *CryptoX* wallet on *Hela Chain* has been created! 🚀✨\nYour address is:',
              )
              await sendSimpleButtonsMessage(recipientPhone, walletAddress, [
                { title: 'What is this?', id: 'info_address' },
              ])
              await sendMenuButtons()
              break
            }
            case 'info_address': {
              await sendSimpleButtonsMessage(
                recipientPhone,
                'An address is like a bank account number you can use to receive money from others. Your CryptoX wallet runs on Hela Chain and uses HLUSD as its native currency.',
                [{ title: 'What is HLUSD?', id: 'info_hlusd' }],
              )
              await sendMenuButtons()
              break
            }
            case 'info_hlusd':
              await sendMessageToPhoneNumber(
                recipientPhone,
                'HLUSD is the native currency of Hela Chain — used for instant payments and transaction fees on the network.',
              )
              await sendMessageToPhoneNumber(recipientPhone, 'For more information, visit:\nhttps://helachain.com')
              await sendMenuButtons()
              break
            case 'cancel_send_money':
              if (!user) throw new Error('Unexpectedly could not find the user')
              await cancelPaymentRequest(user.address)
              await sendMessageToPhoneNumber(recipientPhone, 'Transaction cancelled.')
              await sendMenuButtons()
              break
            default:
              break
          }
        }
      } catch (error) {
        console.error('Error handling message:', error)
        await sendMessageToPhoneNumber(
          recipientPhone,
          `🔴 An error occurred: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`,
        )
      }

      await Whatsapp.markMessageAsRead({ message_id: messageId })
      res.status(200).send('ok')
      return
    } else {
      console.log('Not a message event, ignoring...')
      res.status(200).send('ok')
      return
    }
  } catch (error) {
    console.error('Top level error:', error)
    res.status(500)
    return
  }
}

export default handler