import { Router } from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  replyMessage 
} from '../controllers/message.controller';
import { validateRequest } from '../middleware/validateRequest';
import { sendMessageSchema, replyMessageSchema } from '../validations/message.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.post('/', validateRequest(sendMessageSchema), sendMessage);
router.get('/:conversationId', getMessages);
router.post('/:conversationId/reply', validateRequest(replyMessageSchema), replyMessage);

export default router;
