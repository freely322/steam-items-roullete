import Express from 'express'
import * as userHandler from "../handlers/user.handler";

const router = Express.Router();
router.get('/user/:id', userHandler.getOne);
router.post('/user/updateTradeLink', userHandler.updateUserTradeLink);
router.post('/user/addItems', userHandler.addItems);
router.post('/user/withdrawItems', userHandler.withdrawItems);
module.exports = router;
