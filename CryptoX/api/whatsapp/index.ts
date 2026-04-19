import type { VercelApiHandler, VercelResponse } from '@vercel/node'
import axios from 'axios'
import { WhatsappNewMessageEventNotificationRequest } from './types'
import { sleep } from '../../lib/utils/sleep'

const handler: VercelApiHandler = async (
  req: WhatsappNewMessageEventNotificationRequest,
  res: VercelResponse,
) => {
  if (req.method === 'GET') {
    try {
      const mode = req.query['hub.mode']
      const token = req.query['hub.verify_token']
      const challenge = req.query['hub.challenge']

      console.log('GET /api/whatsapp', { mode, token, challenge })
      console.log('Expected token:', process.env.META_WA_VERIFY_TOKEN)

      if (
        mode &&
        token &&
        mode === 'subscribe' &&
        process.env.META_WA_VERIFY_TOKEN === token
      ) {
        console.log('Verification successful!')
        res.status(200).send(challenge)
        return
      } else {
        console.log('Verification failed - token mismatch or missing params')
        res.status(401).json({ message: 'Unauthorized' })
        return
      }
    } catch (error) {
      console.error({ error })
      res.status(500)
      return
    }
  } else if (req.method === 'POST') {
    console.log('POST /api/whatsapp received', JSON.stringify(req.body, null, 2))

    const messageUrl = `https://${process.env.PROD_URL}/api/whatsapp/message`
    console.log('Forwarding to:', messageUrl)

    try {
      const response = await axios.post(messageUrl, req.body)
      console.log('Forwarded successfully, status:', response.status)
    } catch (error) {
      console.error('Failed to forward to message handler:', error)
    }

    await sleep(50)
    res.status(200).send('ok')
    return
  }

  res.status(405).json({ message: 'Method not allowed' })
  return
}

export default handler 
