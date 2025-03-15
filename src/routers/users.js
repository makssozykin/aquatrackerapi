import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  inputUserSchema,
  refreshTokenSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validation/users.js';
import {
  signinUserController,
  logoutUserController,
  refreshUserSessionController,
  signupUserController,
  getCurrentUserController,
  requestResetEmailController,
  resetPasswordController,
  updateUserController,
  updateUserAvatarController,
  getUsersCounterController,
} from '../controllers/users.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { updateUserSchema } from '../validation/users.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.post(
  '/signup',
  validateBody(inputUserSchema),
  ctrlWrapper(signupUserController),
);
router.post(
  '/signin',
  validateBody(inputUserSchema),
  ctrlWrapper(signinUserController),
);
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  ctrlWrapper(refreshUserSessionController),
);
router.post('/logout', ctrlWrapper(logoutUserController));
router.get('/current', ctrlWrapper(getCurrentUserController));
router.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

router.patch(
  '/update',
  authenticate,
  validateBody(updateUserSchema),
  ctrlWrapper(updateUserController),
);

router.patch(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  ctrlWrapper(updateUserAvatarController),
);

router.get('/counter', ctrlWrapper(getUsersCounterController));

export default router;
