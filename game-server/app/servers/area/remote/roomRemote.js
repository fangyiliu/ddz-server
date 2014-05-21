var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var roomDao = require('../../../dao/roomDao');
var roomService = require('../../../services/roomService');
var messageService = require('../../../services/messageService');
var Player = require('../../../domain/player');
var format = require('util').format;
var utils = require('../../../util/utils');
var cardService = require('../../../services/cardService');
var ErrorCode = require('../../../consts/errorCode');
var userDao = require('../../../dao/userDao');

module.exports = function(app) {
  return new RoomRemote(app);
};

/**
 * 房间远程接口
 * @param app
 * @constructor
 */
var RoomRemote = function(app) {
  this.app = app;
  // this.tableService = app.get('tableService');
  this.channelService = app.get('channelService');
  this.sessionService = app.get('localSessionService');
};

var remoteHandler = RoomRemote.prototype;

remoteHandler.tryEnter = function(uid, sid, sessionId, room_id, cb) {
  var self = this;
  var thisServerId = self.app.getServerId();
  utils.invokeCallback(cb, null, thisServerId, {ret: ErrorCode.SUCCESS});
};

/**
 * 玩家进入房间
 * @param uid - 玩家id
 * @param sid - 玩家所在的前端服务器id
 * @param sessionId - 会话id
 * @param room_id - 要进入的房间id
 * @param cb - 回调
 */
remoteHandler.enter = function(uid, sid, sessionId, room_id, cb) {
  var self = this;
  var thisServerId = self.app.getServerId();

  userDao.getByUserId(uid, function(err, user) {
    if (err) {
      utils.invokeCallback(cb, null, thisServeId, {ret: ErrorCode.USER_NOT_FOUND});
    }

    var player = user;
    player.serverId = sid;

    // 进入房间，并取得玩家所属桌子
    var table = roomService.enterRoom(new Player(player), room_id, -1);
    // cardServer挂接table的playerReady事件
    //utils.on(table, "playerReady", cardService.onPlayerReady);

    var msg = table.toParams();

    // 通知桌子的其他玩家，有新玩家进入
    process.nextTick(function() {
      messageService.pushTableMessage(table, "onPlayerJoin", msg, null);
    });

    // 返回结果
    cb(null, thisServerId, msg);
  });

};

/**
 * 玩家离开房间
 * @param msg
 * @param cb
 */
remoteHandler.leave = function(msg, cb) {
  var uid = msg.uid;
  var room_id = msg.room_id;

  var table = roomService.leave(room_id, uid);
  table.reset();

  messageService.pushTableMessage(table, "onPlayerJoin", table.toParams(), null);
};

var getPlayerIds = function(table) {
  var ids = [];
  for(var index in table.players) {
    var player = table.players[index];
    ids.push({uid: player.userId, sid: player.serverId});
  }
  return ids;
};

remoteHandler.queryRooms = function(msg, cb) {
  logger.info('[%s] [remoteHandler.queryRooms] msg => ', this.app.getServerId(), msg);
  roomDao.getActiveRooms(function(err, rooms) {
    cb(err, rooms);
  });
};